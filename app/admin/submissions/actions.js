"use server";

import { revalidatePath } from "next/cache";
import { fetchFormQuestions } from "@/lib/forms/dynamic-form";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

const ALLOWED_STATUS = new Set([
  "submitted",
  "under_review",
  "approved",
  "denied",
  "waitlisted",
]);

const ADDRESS_KEYS = {
  provincia: "provincia",
  ciudad: "ciudad",
  barrio: "barrio_comunidad",
  direccion: "direccion_exacta",
};

function cleanString(value) {
  return String(value ?? "").trim();
}

function parseNullableNumber(value) {
  const text = cleanString(value);
  if (!text) return null;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseBooleanLike(value) {
  const text = cleanString(value).toLowerCase();
  if (!text) return null;
  if (["1", "true", "si", "sí", "yes"].includes(text)) return true;
  if (["0", "false", "no"].includes(text)) return false;
  return null;
}

function parseNullableIsoDate(value) {
  const text = cleanString(value);
  if (!text) return null;
  const date = new Date(`${text}T12:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function composeCurrentLocation({ provincia, ciudad, barrio, direccion }) {
  const fields = [provincia, ciudad, barrio, direccion]
    .map((item) => cleanString(item))
    .filter(Boolean);

  if (!fields.length) return null;
  return fields.join(", ");
}

async function syncAddressAnswers({
  supabase,
  formId,
  assessmentId,
  provincia,
  ciudad,
  barrio,
  direccion,
}) {
  if (!formId || !assessmentId) return;

  const { data: questions, error: questionsError } = await supabase
    .from("assessment_questions")
    .select("id, question_key")
    .eq("form_id", formId)
    .in("question_key", Object.values(ADDRESS_KEYS));

  if (questionsError) throw questionsError;
  if (!questions?.length) return;

  const questionIdByKey = new Map();
  for (const question of questions) {
    questionIdByKey.set(question.question_key, question.id);
  }

  const questionIds = questions.map((question) => question.id);
  const { data: existingAnswers, error: answersError } = await supabase
    .from("assessment_answers")
    .select("id, question_id")
    .eq("assessment_id", assessmentId)
    .in("question_id", questionIds);

  if (answersError) throw answersError;

  const existingByQuestionId = new Map();
  for (const answer of existingAnswers || []) {
    existingByQuestionId.set(answer.question_id, answer.id);
  }

  const incomingByQuestionKey = {
    [ADDRESS_KEYS.provincia]: cleanString(provincia),
    [ADDRESS_KEYS.ciudad]: cleanString(ciudad),
    [ADDRESS_KEYS.barrio]: cleanString(barrio),
    [ADDRESS_KEYS.direccion]: cleanString(direccion),
  };

  for (const [questionKey, value] of Object.entries(incomingByQuestionKey)) {
    const questionId = questionIdByKey.get(questionKey);
    if (!questionId) continue;

    const existingId = existingByQuestionId.get(questionId);
    if (!value) {
      if (existingId) {
        const { error: deleteError } = await supabase
          .from("assessment_answers")
          .delete()
          .eq("id", existingId);
        if (deleteError) throw deleteError;
      }
      continue;
    }

    if (existingId) {
      const { error: updateError } = await supabase
        .from("assessment_answers")
        .update({
          answer_text: value,
          answer_number: null,
          answer_boolean: null,
          option_id: null,
        })
        .eq("id", existingId);
      if (updateError) throw updateError;
      continue;
    }

    const { error: insertError } = await supabase
      .from("assessment_answers")
      .insert({
        assessment_id: assessmentId,
        question_id: questionId,
        answer_text: value,
      });

    if (insertError) throw insertError;
  }
}

function revalidateAll() {
  revalidatePath("/admin/submissions");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/analytics");
}

function resolveAnswerPayload(question, rawValue) {
  const value = cleanString(rawValue);

  if (!value) {
    return {
      shouldDelete: true,
      payload: null,
    };
  }

  if (question.inputType === "number") {
    const parsed = parseNullableNumber(value);
    if (!Number.isFinite(parsed)) {
      return { shouldDelete: true, payload: null };
    }

    return {
      shouldDelete: false,
      payload: {
        option_id: null,
        answer_text: String(parsed),
        answer_number: parsed,
        answer_boolean: null,
      },
    };
  }

  if (question.inputType === "radio" || question.inputType === "select") {
    const matchedOption =
      question.options.find((option) => option.value === value) ||
      question.options.find((option) => option.id === value) ||
      null;

    return {
      shouldDelete: false,
      payload: {
        option_id: matchedOption?.id || null,
        answer_text: matchedOption?.value || value,
        answer_number: null,
        answer_boolean: null,
      },
    };
  }

  const booleanValue = parseBooleanLike(value);
  if (booleanValue !== null && question.inputType === "boolean") {
    return {
      shouldDelete: false,
      payload: {
        option_id: null,
        answer_text: null,
        answer_number: null,
        answer_boolean: booleanValue,
      },
    };
  }

  return {
    shouldDelete: false,
    payload: {
      option_id: null,
      answer_text: value,
      answer_number: null,
      answer_boolean: null,
    },
  };
}

async function syncAllAnswers({
  supabase,
  formId,
  assessmentId,
  incomingAnswers = [],
}) {
  if (!formId || !assessmentId) return;

  const questions = await fetchFormQuestions(supabase, formId);
  if (!questions.length) return;

  const questionIds = questions.map((question) => question.id);

  const { data: existingAnswers, error: existingAnswersError } = await supabase
    .from("assessment_answers")
    .select("id, question_id")
    .eq("assessment_id", assessmentId)
    .in("question_id", questionIds);

  if (existingAnswersError) throw existingAnswersError;

  const existingByQuestionId = new Map();
  for (const answer of existingAnswers || []) {
    existingByQuestionId.set(answer.question_id, answer.id);
  }

  const incomingByQuestionId = new Map();
  for (const item of incomingAnswers) {
    const questionId = cleanString(item?.questionId);
    if (!questionId) continue;
    incomingByQuestionId.set(questionId, cleanString(item?.value));
  }

  for (const question of questions) {
    const existingAnswerId = existingByQuestionId.get(question.id);
    const rawValue = incomingByQuestionId.get(question.id) ?? "";
    const answer = resolveAnswerPayload(question, rawValue);

    if (answer.shouldDelete) {
      if (!existingAnswerId) continue;

      const { error: deleteError } = await supabase
        .from("assessment_answers")
        .delete()
        .eq("id", existingAnswerId);
      if (deleteError) throw deleteError;
      continue;
    }

    if (existingAnswerId) {
      const { error: updateError } = await supabase
        .from("assessment_answers")
        .update(answer.payload)
        .eq("id", existingAnswerId);
      if (updateError) throw updateError;
      continue;
    }

    const { error: insertError } = await supabase
      .from("assessment_answers")
      .insert({
        assessment_id: assessmentId,
        question_id: question.id,
        ...answer.payload,
      });
    if (insertError) throw insertError;
  }
}

export async function getSubmissionDetailAction(payload) {
  const assessmentId = cleanString(payload?.assessmentId);
  const formId = cleanString(payload?.formId);

  if (!assessmentId || !formId) {
    return { ok: false, message: "No se pudo cargar el detalle de la solicitud." };
  }

  try {
    const supabase = getSupabaseServiceClient();
    const questions = await fetchFormQuestions(supabase, formId);

    const questionIds = questions.map((question) => question.id);
    const { data: answers, error: answersError } = await supabase
      .from("assessment_answers")
      .select("question_id, option_id, answer_text, answer_number, answer_boolean")
      .eq("assessment_id", assessmentId)
      .in("question_id", questionIds);

    if (answersError) throw answersError;

    const answerByQuestionId = new Map();
    for (const answer of answers || []) {
      answerByQuestionId.set(answer.question_id, answer);
    }

    const resolved = questions.map((question) => {
      const answer = answerByQuestionId.get(question.id);
      let value = "";

      if (answer) {
        if (answer.option_id) {
          const selectedOption = question.options.find((option) => option.id === answer.option_id);
          value = selectedOption?.value || String(answer.answer_text || "");
        } else if (Number.isFinite(answer.answer_number)) {
          value = String(answer.answer_number);
        } else if (answer.answer_boolean !== null && answer.answer_boolean !== undefined) {
          value = answer.answer_boolean ? "true" : "false";
        } else {
          value = String(answer.answer_text || "");
        }
      }

      return {
        questionId: question.id,
        key: question.key,
        label: question.label,
        inputType: question.inputType,
        isRequired: question.isRequired,
        sectionKey: question.sectionKey,
        sectionTitle: question.sectionTitle,
        placeholder: question.placeholder || "",
        value,
        options: question.options.map((option) => ({
          id: option.id,
          label: option.label,
          value: option.value,
        })),
      };
    });

    return { ok: true, questions: resolved };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo cargar el detalle de la solicitud.";
    return { ok: false, message };
  }
}

export async function updateSubmissionAction(payload) {
  const assessmentId = cleanString(payload?.assessmentId);
  const applicantId = cleanString(payload?.applicantId);
  const formId = cleanString(payload?.formId);

  if (!assessmentId || !applicantId || !formId) {
    return { ok: false, message: "No se pudo identificar la solicitud." };
  }

  const statusRaw = cleanString(payload?.status).toLowerCase();
  const status = ALLOWED_STATUS.has(statusRaw) ? statusRaw : "submitted";

  const fullName = cleanString(payload?.applicantName);
  const phone = cleanString(payload?.applicantPhone);
  const householdSize = parseNullableNumber(payload?.householdSize);
  const score = parseNullableNumber(payload?.score);
  const submittedAt = parseNullableIsoDate(payload?.submittedAt);
  const provincia = cleanString(payload?.province);
  const ciudad = cleanString(payload?.city);
  const barrio = cleanString(payload?.barrio);
  const direccion = cleanString(payload?.address);
  const answers = Array.isArray(payload?.answers) ? payload.answers : [];

  try {
    const supabase = getSupabaseServiceClient();

    const { error: applicantError } = await supabase
      .from("applicants")
      .update({
        full_name: fullName || "Solicitante",
        phone: phone || null,
        household_size: householdSize,
        current_location: composeCurrentLocation({
          provincia,
          ciudad,
          barrio,
          direccion,
        }),
      })
      .eq("id", applicantId);

    if (applicantError) throw applicantError;

    const { error: assessmentError } = await supabase
      .from("assessments")
      .update({
        status,
        total_score: score,
        submitted_at: submittedAt,
      })
      .eq("id", assessmentId);

    if (assessmentError) throw assessmentError;

    await syncAddressAnswers({
      supabase,
      formId,
      assessmentId,
      provincia,
      ciudad,
      barrio,
      direccion,
    });

    await syncAllAnswers({
      supabase,
      formId,
      assessmentId,
      incomingAnswers: answers,
    });

    revalidateAll();
    return { ok: true, message: "Solicitud actualizada." };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo actualizar la solicitud.";
    return { ok: false, message };
  }
}

export async function deleteSubmissionAction(payload) {
  const assessmentId = cleanString(payload?.assessmentId);
  const applicantId = cleanString(payload?.applicantId);

  if (!assessmentId || !applicantId) {
    return { ok: false, message: "No se pudo identificar la solicitud." };
  }

  try {
    const supabase = getSupabaseServiceClient();

    const { error: historyError } = await supabase
      .from("assessment_status_history")
      .delete()
      .eq("assessment_id", assessmentId);
    if (historyError) throw historyError;

    const { error: answersError } = await supabase
      .from("assessment_answers")
      .delete()
      .eq("assessment_id", assessmentId);
    if (answersError) throw answersError;

    const { error: assessmentError } = await supabase
      .from("assessments")
      .delete()
      .eq("id", assessmentId);
    if (assessmentError) throw assessmentError;

    const { count, error: remainingError } = await supabase
      .from("assessments")
      .select("id", { count: "exact", head: true })
      .eq("applicant_id", applicantId);

    if (remainingError) throw remainingError;

    if (!count) {
      const { error: applicantDeleteError } = await supabase
        .from("applicants")
        .delete()
        .eq("id", applicantId);
      if (applicantDeleteError) throw applicantDeleteError;
    }

    revalidateAll();
    return { ok: true, message: "Solicitud eliminada." };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo eliminar la solicitud.";
    return { ok: false, message };
  }
}
