import { NextResponse } from "next/server";
import {
  fetchFormQuestions,
  getOrCreateFormBySlug,
  seedTemplateQuestionsIfEmpty,
} from "@/lib/forms/dynamic-form";
import { isLikelySpam, isRateLimited } from "@/lib/security/spam-guard";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

const UPLOADS_BUCKET = "assessment-uploads";

function shouldReturnHtmlRedirect(request, incoming) {
  if (incoming.isJson) return false;
  const accept = request.headers.get("accept") || "";
  return accept.includes("text/html");
}

function toCleanString(value) {
  return String(value ?? "").trim();
}

function toSafeFileName(name) {
  return String(name || "archivo")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 80);
}

function toNullableInt(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.max(0, Math.round(parsed));
}

async function parseIncomingData(request) {
  const contentType = request.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  if (isJson) {
    const data = await request.json();
    return {
      contentType,
      isJson,
      data,
      get(name) {
        return data?.[name];
      },
    };
  }

  const data = await request.formData();
  return {
    contentType,
    isJson,
    data,
    get(name) {
      return data.get(name);
    },
  };
}

async function ensureUploadsBucket(supabase) {
  const { error } = await supabase.storage.createBucket(UPLOADS_BUCKET, {
    public: false,
    fileSizeLimit: 10 * 1024 * 1024,
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/heic"],
  });

  if (error && !/already exists/i.test(error.message || "")) {
    throw error;
  }
}

async function buildAnswerRows({
  incoming,
  questions,
  assessmentId,
  supabase,
  formSlug,
}) {
  const errors = {};
  const prepared = [];
  const answerLookup = new Map();

  for (const question of questions) {
    const fieldName = `q__${question.key}`;
    const rawEntry = incoming.get(fieldName);
    const inputType = question.inputType;
    const isRequired = question.isRequired;

    let answerText = null;
    let answerNumber = null;
    let optionId = null;
    let fileEntry = null;

    if (inputType === "file") {
      const fileCandidate = rawEntry instanceof File ? rawEntry : null;
      if (fileCandidate && fileCandidate.size > 0) {
        fileEntry = fileCandidate;
      }

      if (isRequired && !fileEntry) {
        errors[question.key] = "Archivo requerido.";
      }
    } else {
      const value = toCleanString(rawEntry);

      if (isRequired && !value) {
        errors[question.key] = "Campo requerido.";
        continue;
      }

      if (inputType === "number") {
        if (value) {
          const numericValue = Number(value);
          if (!Number.isFinite(numericValue)) {
            errors[question.key] = "Debe ser un numero valido.";
            continue;
          }
          answerNumber = numericValue;
          answerText = value;
        }
      } else if (inputType === "radio" || inputType === "select") {
        if (value) {
          const optionMatch = question.options.find((option) => option.value === value);
          if (!optionMatch) {
            errors[question.key] = "Seleccione una opcion valida.";
            continue;
          }
          optionId = optionMatch.id;
          answerText = value;
        }
      } else if (value) {
        answerText = value;
      }
    }

    answerLookup.set(question.key, {
      text: answerText,
      number: answerNumber,
      hasFile: Boolean(fileEntry),
    });

    prepared.push({
      question,
      optionId,
      answerText,
      answerNumber,
      fileEntry,
    });
  }

  if (Object.keys(errors).length > 0) {
    return { errors, rows: [], answerLookup };
  }

  const hasUploads = prepared.some((item) => item.fileEntry);
  if (hasUploads) {
    await ensureUploadsBucket(supabase);
  }

  const rows = [];
  for (const item of prepared) {
    let finalText = item.answerText;

    if (item.fileEntry) {
      const file = item.fileEntry;
      const fileName = toSafeFileName(file.name);
      const uploadPath = `${formSlug}/${assessmentId}/${item.question.key}-${Date.now()}-${fileName}`;
      const fileBytes = new Uint8Array(await file.arrayBuffer());

      const { error: uploadError } = await supabase.storage
        .from(UPLOADS_BUCKET)
        .upload(uploadPath, fileBytes, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      finalText = `storage://${UPLOADS_BUCKET}/${uploadPath}`;
      answerLookup.set(item.question.key, {
        text: finalText,
        number: null,
        hasFile: true,
      });
    }

    const hasValue =
      Boolean(item.optionId) ||
      finalText !== null ||
      item.answerNumber !== null;
    if (!hasValue) continue;

    rows.push({
      assessment_id: assessmentId,
      question_id: item.question.id,
      option_id: item.optionId,
      answer_text: finalText,
      answer_number: item.answerNumber,
      answer_boolean: null,
    });
  }

  return { errors: {}, rows, answerLookup };
}

export async function POST(request) {
  const forwardedFor = request.headers.get("x-forwarded-for") || "";
  const clientIp = forwardedFor.split(",")[0]?.trim() || "unknown";
  const incoming = await parseIncomingData(request);
  const wantsHtmlRedirect = shouldReturnHtmlRedirect(request, incoming);

  const formSlug = toCleanString(incoming.get("form_slug"));
  const startedAt = incoming.get("started_at");
  const honeypot = incoming.get("company");

  if (isLikelySpam({ honeypotValue: honeypot, startedAt })) {
    return NextResponse.json(
      { ok: false, message: "Envio bloqueado por proteccion anti-spam." },
      { status: 400 },
    );
  }

  if (isRateLimited({ key: clientIp })) {
    return NextResponse.json(
      { ok: false, message: "Demasiados intentos. Intente nuevamente pronto." },
      { status: 429 },
    );
  }

  if (!formSlug) {
    return NextResponse.json(
      { ok: false, errors: { form_slug: "Formulario invalido." } },
      { status: 422 },
    );
  }

  let createdApplicantId = null;
  let createdAssessmentId = null;

  try {
    const supabase = getSupabaseServiceClient();
    const form = await getOrCreateFormBySlug(supabase, formSlug);
    await seedTemplateQuestionsIfEmpty(supabase, form.id);
    const questions = await fetchFormQuestions(supabase, form.id);

    if (!questions.length) {
      return NextResponse.json(
        { ok: false, message: "No hay preguntas activas en este formulario." },
        { status: 422 },
      );
    }

    const { data: applicant, error: applicantError } = await supabase
      .from("applicants")
      .insert({
        full_name: "Pendiente",
        phone: "Pendiente",
      })
      .select("id")
      .single();

    if (applicantError) throw applicantError;
    createdApplicantId = applicant.id;

    const { data: assessment, error: assessmentError } = await supabase
      .from("assessments")
      .insert({
        applicant_id: applicant.id,
        form_id: form.id,
        status: "submitted",
        submitted_at: new Date().toISOString(),
      })
      .select("id, status, submitted_at")
      .single();

    if (assessmentError) throw assessmentError;
    createdAssessmentId = assessment.id;

    const { errors, rows, answerLookup } = await buildAnswerRows({
      incoming,
      questions,
      assessmentId: assessment.id,
      supabase,
      formSlug: form.slug,
    });

    if (Object.keys(errors).length > 0) {
      await supabase.from("assessments").delete().eq("id", assessment.id);
      await supabase.from("applicants").delete().eq("id", applicant.id);

      return NextResponse.json({ ok: false, errors }, { status: 422 });
    }

    if (rows.length > 0) {
      const { error: answersError } = await supabase
        .from("assessment_answers")
        .insert(rows);

      if (answersError) throw answersError;
    }

    const fullName =
      answerLookup.get("nombre_jefe_familia")?.text ||
      answerLookup.get("nombre_firma")?.text ||
      "Solicitante";
    const phone = answerLookup.get("telefono_contacto")?.text || "No registrado";
    const householdSize = toNullableInt(
      answerLookup.get("numero_total_miembros")?.number ??
        answerLookup.get("numero_total_miembros")?.text,
    );
    const currentLocation = [
      answerLookup.get("provincia")?.text,
      answerLookup.get("ciudad")?.text,
      answerLookup.get("barrio_comunidad")?.text,
      answerLookup.get("direccion_exacta")?.text,
    ]
      .filter(Boolean)
      .join(", ");

    const { error: applicantUpdateError } = await supabase
      .from("applicants")
      .update({
        full_name: fullName,
        phone,
        household_size: householdSize,
        national_id: answerLookup.get("documento_identificacion")?.text || null,
        current_location: currentLocation || null,
      })
      .eq("id", applicant.id);

    if (applicantUpdateError) throw applicantUpdateError;

    const { error: historyError } = await supabase
      .from("assessment_status_history")
      .insert({
        assessment_id: assessment.id,
        from_status: null,
        to_status: "submitted",
        notes: JSON.stringify({
          answers_count: rows.length,
          form_slug: form.slug,
        }),
      });

    if (historyError) {
      console.warn("Assessment status history insert warning:", historyError);
    }

    if (wantsHtmlRedirect) {
      const redirectUrl = new URL(`/apply/${encodeURIComponent(form.slug)}`, request.url);
      redirectUrl.searchParams.set("submitted", "1");
      return NextResponse.redirect(redirectUrl, { status: 303 });
    }

    return NextResponse.json(
      {
        ok: true,
        message: "Formulario recibido correctamente.",
        data: {
          assessment_id: assessment.id,
          applicant_id: applicant.id,
          form_slug: form.slug,
          status: assessment.status,
          submitted_at: assessment.submitted_at,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    try {
      if (createdAssessmentId || createdApplicantId) {
        const cleanupClient = getSupabaseServiceClient();
        if (createdAssessmentId) {
          await cleanupClient.from("assessments").delete().eq("id", createdAssessmentId);
        }
        if (createdApplicantId) {
          await cleanupClient.from("applicants").delete().eq("id", createdApplicantId);
        }
      }
    } catch (cleanupError) {
      console.error("Assessment cleanup failed:", cleanupError);
    }

    console.error("Assessment persistence failed:", error);
    return NextResponse.json(
      { ok: false, message: "No fue posible guardar el formulario en este momento." },
      { status: 500 },
    );
  }
}
