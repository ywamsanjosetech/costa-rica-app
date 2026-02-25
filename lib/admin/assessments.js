import { getSupabaseServiceClient } from "@/lib/supabase/server";

const PAGE_SIZE = 1000;
const ADDRESS_QUESTION_KEYS = [
  "provincia",
  "ciudad",
  "barrio_comunidad",
  "direccion_exacta",
];

const STATUS_LABELS = {
  submitted: "Pendiente",
  under_review: "En revisión",
  approved: "Aprobado",
  denied: "Denegado",
  waitlisted: "Lista de espera",
};

const STATUS_TONES = {
  submitted: "pink",
  under_review: "blue",
  approved: "success",
  denied: "neutral",
  waitlisted: "neutral",
};

const COSTA_RICA_PROVINCES = [
  "San Jose",
  "Alajuela",
  "Cartago",
  "Heredia",
  "Guanacaste",
  "Puntarenas",
  "Limon",
];

function toLookupKey(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function chunkArray(items, chunkSize) {
  const chunks = [];
  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }
  return chunks;
}

function toNullableNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function buildYearRange(year) {
  const from = `${year}-01-01T00:00:00.000Z`;
  const to = `${year + 1}-01-01T00:00:00.000Z`;
  return { from, to };
}

function findProvinceInText(rawText) {
  const normalized = toLookupKey(rawText);
  if (!normalized) return null;

  for (const province of COSTA_RICA_PROVINCES) {
    if (normalized.includes(toLookupKey(province))) {
      return province;
    }
  }
  return null;
}

function composeAddress(addressParts = {}, fallbackLocation = null) {
  const fields = [
    addressParts.provincia,
    addressParts.ciudad,
    addressParts.barrio_comunidad,
    addressParts.direccion_exacta,
  ]
    .map((item) => String(item || "").trim())
    .filter(Boolean);

  if (fields.length) return fields.join(", ");
  return String(fallbackLocation || "").trim() || null;
}

async function fetchAssessmentsRaw({ year = null } = {}) {
  const supabase = getSupabaseServiceClient();
  const rows = [];
  let page = 0;

  while (true) {
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from("assessments")
      .select("id, applicant_id, form_id, status, total_score, submitted_at")
      .order("submitted_at", { ascending: false })
      .range(from, to);

    if (Number.isFinite(year)) {
      const range = buildYearRange(year);
      query = query.gte("submitted_at", range.from).lt("submitted_at", range.to);
    }

    const { data, error } = await query;
    if (error) throw new Error(`No fue posible cargar solicitudes: ${error.message}`);

    rows.push(...(data || []));
    if (!data || data.length < PAGE_SIZE) break;
    page += 1;
  }

  return rows;
}

async function fetchApplicantsByIds(applicantIds) {
  if (!applicantIds.length) return new Map();

  const supabase = getSupabaseServiceClient();
  const byId = new Map();
  const chunks = chunkArray(applicantIds, 500);

  for (const chunk of chunks) {
    const { data, error } = await supabase
      .from("applicants")
      .select("id, full_name, phone, household_size, current_location")
      .in("id", chunk);

    if (error) throw new Error(`No fue posible cargar solicitantes: ${error.message}`);
    for (const row of data || []) byId.set(row.id, row);
  }

  return byId;
}

async function fetchFormsByIds(formIds) {
  if (!formIds.length) return new Map();

  const supabase = getSupabaseServiceClient();
  const byId = new Map();
  const chunks = chunkArray(formIds, 500);

  for (const chunk of chunks) {
    const { data, error } = await supabase
      .from("assessment_forms")
      .select("id, slug, title")
      .in("id", chunk);

    if (error) throw new Error(`No fue posible cargar formularios: ${error.message}`);
    for (const row of data || []) byId.set(row.id, row);
  }

  return byId;
}

async function fetchAddressPartsByAssessmentIds(assessmentIds) {
  if (!assessmentIds.length) return new Map();

  const supabase = getSupabaseServiceClient();
  const byAssessment = new Map();

  const { data: questions, error: questionsError } = await supabase
    .from("assessment_questions")
    .select("id, question_key")
    .in("question_key", ADDRESS_QUESTION_KEYS);

  if (questionsError) {
    throw new Error(
      `No fue posible cargar preguntas de dirección: ${questionsError.message}`,
    );
  }

  const questionKeyById = new Map();
  for (const row of questions || []) {
    questionKeyById.set(row.id, row.question_key);
  }

  const questionIds = [...questionKeyById.keys()];
  if (!questionIds.length) return byAssessment;

  const chunks = chunkArray(assessmentIds, 350);
  for (const chunk of chunks) {
    const { data, error } = await supabase
      .from("assessment_answers")
      .select("assessment_id, question_id, answer_text")
      .in("assessment_id", chunk)
      .in("question_id", questionIds);

    if (error) {
      throw new Error(`No fue posible cargar respuestas de dirección: ${error.message}`);
    }

    for (const row of data || []) {
      const questionKey = questionKeyById.get(row.question_id);
      if (!questionKey) continue;
      if (!byAssessment.has(row.assessment_id)) byAssessment.set(row.assessment_id, {});

      const current = byAssessment.get(row.assessment_id);
      current[questionKey] = String(row.answer_text || "").trim() || null;
    }
  }

  return byAssessment;
}

export function toStatusLabel(status) {
  const key = toLookupKey(status).replace(/\s+/g, "_");
  return STATUS_LABELS[key] || "Sin estado";
}

export function toStatusTone(status) {
  const key = toLookupKey(status).replace(/\s+/g, "_");
  return STATUS_TONES[key] || "neutral";
}

export async function fetchAssessmentSummaries({ year = null } = {}) {
  const assessments = await fetchAssessmentsRaw({ year });

  if (!assessments.length) return [];

  const applicantIds = [...new Set(assessments.map((item) => item.applicant_id).filter(Boolean))];
  const formIds = [...new Set(assessments.map((item) => item.form_id).filter(Boolean))];
  const assessmentIds = assessments.map((item) => item.id);

  const [applicantsById, formsById, addressPartsByAssessment] = await Promise.all([
    fetchApplicantsByIds(applicantIds),
    fetchFormsByIds(formIds),
    fetchAddressPartsByAssessmentIds(assessmentIds),
  ]);

  return assessments.map((assessment) => {
    const applicant = applicantsById.get(assessment.applicant_id) || null;
    const form = formsById.get(assessment.form_id) || null;
    const addressParts = addressPartsByAssessment.get(assessment.id) || {};

    const address = composeAddress(addressParts, applicant?.current_location);
    const province =
      String(addressParts.provincia || "").trim() ||
      findProvinceInText(applicant?.current_location) ||
      findProvinceInText(address) ||
      "Sin provincia";

    return {
      id: assessment.id,
      status: String(assessment.status || "").trim() || "submitted",
      statusLabel: toStatusLabel(assessment.status),
      statusTone: toStatusTone(assessment.status),
      score: toNullableNumber(assessment.total_score),
      submittedAt: assessment.submitted_at || null,
      submittedDate: assessment.submitted_at ? new Date(assessment.submitted_at) : null,
      applicantId: assessment.applicant_id || null,
      applicantName: String(applicant?.full_name || "").trim() || "Solicitante",
      applicantPhone: String(applicant?.phone || "").trim() || "No registrado",
      householdSize: toNullableNumber(applicant?.household_size),
      address,
      province,
      city: String(addressParts.ciudad || "").trim() || null,
      barrio: String(addressParts.barrio_comunidad || "").trim() || null,
      formId: assessment.form_id || null,
      formSlug: String(form?.slug || "").trim() || "sin-slug",
      formTitle: String(form?.title || "").trim() || "Formulario",
    };
  });
}
