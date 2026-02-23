import { NextResponse } from "next/server";
import { isLikelySpam, isRateLimited } from "@/lib/security/spam-guard";
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

export async function POST(request) {
  const contentType = request.headers.get("content-type") || "";
  const clientIp = request.headers.get("x-forwarded-for") || "unknown";

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

  const submission = {
    form_slug: clean.formSlug,
    full_name: clean.fullName,
    phone: clean.phone,
    living_situation: clean.livingSituation,
    household_size: clean.householdSize,
    submitted_at: new Date().toISOString(),
  };

  // TODO: Persist with Supabase server client once auth + DB credentials are configured.
  return NextResponse.json(
    {
      ok: true,
      message: "Assessment received.",
      data: submission,
    },
    { status: 201 },
  );
}
