"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  DEFAULT_FORM_SLUG,
  encodeQuestionMeta,
  getOrCreateFormBySlug,
  normalizeOptionList,
  parseQuestionMeta,
  seedTemplateQuestionsIfEmpty,
  toSlugKey,
} from "@/lib/forms/dynamic-form";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

const ALLOWED_INPUT_TYPES = new Set([
  "text",
  "textarea",
  "number",
  "select",
  "radio",
  "date",
  "file",
]);

function toCleanString(value) {
  return String(value ?? "").trim();
}

function toBoolean(value) {
  return value === "on" || value === "true" || value === "1";
}

function toInputType(value) {
  const inputType = toCleanString(value).toLowerCase();
  return ALLOWED_INPUT_TYPES.has(inputType) ? inputType : "text";
}

async function getFormContext() {
  const supabase = getSupabaseServiceClient();
  const form = await getOrCreateFormBySlug(supabase, DEFAULT_FORM_SLUG);
  await seedTemplateQuestionsIfEmpty(supabase, form.id);

  return { supabase, form };
}

async function buildUniqueQuestionKey({ supabase, formId, label }) {
  const baseKey = toSlugKey(label, "pregunta");
  let candidate = baseKey;
  let suffix = 2;

  while (true) {
    const { data, error } = await supabase
      .from("assessment_questions")
      .select("id")
      .eq("form_id", formId)
      .eq("question_key", candidate)
      .maybeSingle();

    if (error) throw error;
    if (!data?.id) return candidate;

    candidate = `${baseKey}_${suffix}`;
    suffix += 1;
  }
}

function buildQuestionMeta(formData) {
  const sectionTitle = toCleanString(formData.get("section_title")) || "General";
  const placeholder = toCleanString(formData.get("placeholder"));
  return {
    sectionTitle,
    sectionKey: toSlugKey(sectionTitle, "general"),
    placeholder,
  };
}

function shouldUseOptions(inputType) {
  return inputType === "radio" || inputType === "select";
}

function revalidateFormPaths(formSlug) {
  revalidatePath("/admin/form-builder");
  revalidatePath(`/apply/${formSlug}`);
}

export async function createQuestionAction(formData) {
  const label = toCleanString(formData.get("label"));
  if (!label) return;

  const inputType = toInputType(formData.get("input_type"));
  const isRequired = toBoolean(formData.get("is_required"));
  const meta = buildQuestionMeta(formData);
  const options = shouldUseOptions(inputType)
    ? normalizeOptionList(formData.get("options_csv"))
    : [];

  const { supabase, form } = await getFormContext();
  const questionKey = await buildUniqueQuestionKey({
    supabase,
    formId: form.id,
    label,
  });

  const { data: lastQuestion, error: orderError } = await supabase
    .from("assessment_questions")
    .select("order_index")
    .eq("form_id", form.id)
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (orderError) throw orderError;
  const nextOrderIndex = (lastQuestion?.order_index || 0) + 1;

  const { data: questionRow, error: insertError } = await supabase
    .from("assessment_questions")
    .insert({
      form_id: form.id,
      question_key: questionKey,
      label,
      help_text: encodeQuestionMeta(meta),
      input_type: inputType,
      is_required: isRequired,
      order_index: nextOrderIndex,
      scoring_weight: 1,
      is_active: true,
    })
    .select("id")
    .single();

  if (insertError) throw insertError;

  if (options.length > 0) {
    const optionRows = options.map((option) => ({
      ...option,
      question_id: questionRow.id,
    }));

    const { error: optionsError } = await supabase
      .from("assessment_question_options")
      .insert(optionRows);

    if (optionsError) throw optionsError;
  }

  revalidateFormPaths(form.slug);
}

export async function renameSectionAction(formData) {
  const sectionKey = toCleanString(formData.get("section_key")) || "general";
  const sectionTitle = toCleanString(formData.get("section_title"));
  if (!sectionTitle) return;

  const { supabase, form } = await getFormContext();
  const nextSectionKey = toSlugKey(sectionTitle, "general");

  const { data: questions, error: questionsError } = await supabase
    .from("assessment_questions")
    .select("id, help_text")
    .eq("form_id", form.id)
    .eq("is_active", true)
    .order("order_index", { ascending: true });

  if (questionsError) throw questionsError;
  if (!questions?.length) return;

  const updates = questions
    .map((question) => {
      const meta = parseQuestionMeta(question.help_text);
      if ((meta.sectionKey || "general") !== sectionKey) return null;

      return {
        id: question.id,
        helpText: encodeQuestionMeta({
          ...meta,
          sectionKey: nextSectionKey,
          sectionTitle,
        }),
      };
    })
    .filter(Boolean);

  for (const update of updates) {
    const { error: updateError } = await supabase
      .from("assessment_questions")
      .update({
        help_text: update.helpText,
        updated_at: new Date().toISOString(),
      })
      .eq("id", update.id)
      .eq("form_id", form.id);

    if (updateError) throw updateError;
  }

  revalidateFormPaths(form.slug);
  redirect("/admin/form-builder?notice=section-updated");
}

export async function updateQuestionAction(formData) {
  const questionId = toCleanString(formData.get("question_id"));
  const label = toCleanString(formData.get("label"));
  if (!questionId || !label) return;

  const inputType = toInputType(formData.get("input_type"));
  const isRequired = toBoolean(formData.get("is_required"));
  const meta = buildQuestionMeta(formData);
  const options = shouldUseOptions(inputType)
    ? normalizeOptionList(formData.get("options_csv"))
    : [];

  const { supabase, form } = await getFormContext();

  const { error: updateError } = await supabase
    .from("assessment_questions")
    .update({
      label,
      input_type: inputType,
      is_required: isRequired,
      help_text: encodeQuestionMeta(meta),
      updated_at: new Date().toISOString(),
    })
    .eq("id", questionId)
    .eq("form_id", form.id);

  if (updateError) throw updateError;

  const { error: deleteOptionsError } = await supabase
    .from("assessment_question_options")
    .delete()
    .eq("question_id", questionId);

  if (deleteOptionsError) throw deleteOptionsError;

  if (options.length > 0) {
    const optionRows = options.map((option) => ({
      ...option,
      question_id: questionId,
    }));

    const { error: insertOptionsError } = await supabase
      .from("assessment_question_options")
      .insert(optionRows);

    if (insertOptionsError) throw insertOptionsError;
  }

  revalidateFormPaths(form.slug);
}

export async function deleteQuestionAction(formData) {
  const questionId = toCleanString(formData.get("question_id"));
  if (!questionId) return;

  const { supabase, form } = await getFormContext();
  const { error: deleteError } = await supabase
    .from("assessment_questions")
    .delete()
    .eq("id", questionId)
    .eq("form_id", form.id);

  if (deleteError) {
    const isFkConstraint = deleteError.code === "23503";

    if (!isFkConstraint) {
      throw deleteError;
    }

    const { error: softDeleteError } = await supabase
      .from("assessment_questions")
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", questionId)
      .eq("form_id", form.id);

    if (softDeleteError) throw softDeleteError;
  }

  revalidateFormPaths(form.slug);
}
