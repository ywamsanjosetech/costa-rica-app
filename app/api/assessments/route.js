import { NextResponse } from "next/server";
import { isLikelySpam, isRateLimited } from "@/lib/security/spam-guard";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { validateAssessmentPayload } from "@/lib/validation/assessment";

function normalizePayload(contentType, data) {
  if (contentType.includes("application/json")) return data;

  return {
    form_slug: data.get("form_slug"),
    started_at: data.get("started_at"),
    company: data.get("company"),
    full_name: data.get("full_name"),
    phone: data.get("phone"),
    living_situation: data.get("living_situation"),
    household_size: data.get("household_size"),
  };
}

function toHouseholdSizeInt(value) {
  const normalized = String(value || "").trim();
  if (!normalized) return null;

  if (/^\d+$/.test(normalized)) {
    return Number(normalized);
  }

  const rangeMap = {
    "2-3": 3,
    "4-6": 6,
    "7+": 7,
  };

  return rangeMap[normalized] ?? null;
}

function titleFromSlug(slug) {
  return String(slug || "")
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

async function getOrCreateFormId(supabase, slug) {
  const { data: existingForm, error: findError } = await supabase
    .from("assessment_forms")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (findError) throw findError;
  if (existingForm?.id) return existingForm.id;

  const { data: createdForm, error: createError } = await supabase
    .from("assessment_forms")
    .insert({
      slug,
      title: titleFromSlug(slug),
      description: "Auto-created from public intake route.",
      is_active: true,
    })
    .select("id")
    .single();

  if (createError) throw createError;
  return createdForm.id;
}

export async function POST(request) {
  const contentType = request.headers.get("content-type") || "";
  const forwardedFor = request.headers.get("x-forwarded-for") || "";
  const clientIp = forwardedFor.split(",")[0]?.trim() || "unknown";

  let data;
  if (contentType.includes("application/json")) {
    data = await request.json();
  } else {
    data = await request.formData();
  }

  const payload = normalizePayload(contentType, data);

  if (
    isLikelySpam({
      honeypotValue: payload.company,
      startedAt: payload.started_at,
    })
  ) {
    return NextResponse.json(
      { ok: false, message: "Submission blocked." },
      { status: 400 },
    );
  }

  if (isRateLimited({ key: clientIp })) {
    return NextResponse.json(
      { ok: false, message: "Too many requests. Try again soon." },
      { status: 429 },
    );
  }

  const { isValid, errors, clean } = validateAssessmentPayload(payload);
  if (!isValid) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  try {
    const supabase = getSupabaseServiceClient();
    const formId = await getOrCreateFormId(supabase, clean.formSlug);

    const householdSize = toHouseholdSizeInt(clean.householdSize);

    const { data: applicant, error: applicantError } = await supabase
      .from("applicants")
      .insert({
        full_name: clean.fullName,
        phone: clean.phone,
        household_size: householdSize,
      })
      .select("id, full_name, phone, household_size, created_at")
      .single();

    if (applicantError) throw applicantError;

    const { data: assessment, error: assessmentError } = await supabase
      .from("assessments")
      .insert({
        applicant_id: applicant.id,
        form_id: formId,
        status: "submitted",
        submitted_at: new Date().toISOString(),
      })
      .select("id, status, submitted_at")
      .single();

    if (assessmentError) throw assessmentError;

    // Store intake context without changing schema.
    const { error: historyError } = await supabase
      .from("assessment_status_history")
      .insert({
        assessment_id: assessment.id,
        from_status: null,
        to_status: "submitted",
        notes: JSON.stringify({
          living_situation: clean.livingSituation,
          household_size_input: clean.householdSize,
        }),
      });

    if (historyError) {
      console.warn("Assessment status history insert warning:", historyError);
    }

    return NextResponse.json(
      {
        ok: true,
        message: "Assessment received.",
        data: {
          assessment_id: assessment.id,
          applicant_id: applicant.id,
          form_slug: clean.formSlug,
          status: assessment.status,
          submitted_at: assessment.submitted_at,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Assessment persistence failed:", error);
    return NextResponse.json(
      { ok: false, message: "Unable to save assessment right now." },
      { status: 500 },
    );
  }
}
