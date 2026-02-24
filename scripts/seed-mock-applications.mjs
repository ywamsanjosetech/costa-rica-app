import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const DEFAULT_FORM_SLUG = "housing-relief-2026";
const DEFAULT_COUNT = 100;

function loadEnvFile(fileName = ".env.local") {
  const filePath = path.resolve(process.cwd(), fileName);
  if (!fs.existsSync(filePath)) return;

  const source = fs.readFileSync(filePath, "utf8");
  for (const line of source.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex <= 0) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    const rawValue = trimmed.slice(eqIndex + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, "");

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function parseArgs(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) continue;

    const key = arg.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      parsed[key] = "true";
      continue;
    }

    parsed[key] = next;
    index += 1;
  }

  return parsed;
}

function toPositiveInt(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
}

function mulberry32(seed) {
  let state = seed >>> 0;
  return function next() {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildRandom(seedInput) {
  const seedHash = crypto.createHash("sha256").update(String(seedInput)).digest("hex");
  const seed = Number.parseInt(seedHash.slice(0, 8), 16);
  const random = mulberry32(seed);

  return {
    number(min, max) {
      const n = random();
      return Math.floor(n * (max - min + 1)) + min;
    },
    pick(items) {
      return items[this.number(0, items.length - 1)];
    },
    weighted(items) {
      const total = items.reduce((sum, item) => sum + item.weight, 0);
      let cursor = random() * total;
      for (const item of items) {
        cursor -= item.weight;
        if (cursor <= 0) return item.value;
      }
      return items[items.length - 1].value;
    },
    chance(probability) {
      return random() < probability;
    },
  };
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function randomSubmittedAt(rand) {
  const now = new Date();
  const daysBack = rand.number(3, 220);
  const hoursBack = rand.number(1, 23);
  const submitted = new Date(
    now.getTime() - (daysBack * 24 + hoursBack) * 60 * 60 * 1000,
  );
  return submitted.toISOString();
}

function randomReviewedAt(submittedAt, rand) {
  const submittedDate = new Date(submittedAt);
  const reviewDays = rand.number(1, 35);
  const reviewed = new Date(submittedDate.getTime() + reviewDays * 24 * 60 * 60 * 1000);
  const now = new Date();
  return reviewed > now ? now.toISOString() : reviewed.toISOString();
}

function buildApplicantProfile(index, rand) {
  const firstNames = [
    "Daniel",
    "María",
    "Carlos",
    "Ana",
    "Luis",
    "Valeria",
    "Esteban",
    "Sofía",
    "José",
    "Camila",
    "Miguel",
    "Fernanda",
    "Andrés",
    "Paula",
    "Sebastián",
    "Elena",
  ];
  const lastNames = [
    "Rodríguez",
    "Mora",
    "González",
    "Vargas",
    "Herrera",
    "Ramírez",
    "Jiménez",
    "Solano",
    "Araya",
    "Quesada",
    "Rojas",
    "Pérez",
  ];
  const occupations = [
    "Operario de construcción",
    "Servicios domésticos",
    "Comercio informal",
    "Conductor",
    "Cuidador adulto mayor",
    "Vendedor ambulante",
    "Cocinero",
    "Asistente de bodega",
    "Mantenimiento",
    "Sin empleo actualmente",
  ];
  const cantons = [
    "San José",
    "Desamparados",
    "Goicoechea",
    "Alajuelita",
    "Tibás",
    "Moravia",
    "Escazú",
    "Curridabat",
    "Hatillo",
    "Pavas",
  ];
  const barrios = [
    "San Sebastián",
    "Sagrada Familia",
    "Paso Ancho",
    "Hatillo 6",
    "Barrio Cuba",
    "Lomas del Río",
    "Los Guido",
    "Aserrí Centro",
    "Guadalupe Centro",
    "La Carpio",
    "San Francisco de Dos Ríos",
  ];

  const fullName = `${rand.pick(firstNames)} ${rand.pick(lastNames)} ${rand.pick(lastNames)}`;
  const householdSize = rand.number(2, 8);
  const minors = rand.number(0, Math.max(0, householdSize - 1));
  const canton = rand.pick(cantons);
  const barrio = rand.pick(barrios);
  const occupation = rand.pick(occupations);
  const nationalId = `${rand.number(1, 9)}-${rand.number(1000, 9999)}-${rand.number(1000, 9999)}`;
  const phone = `+506 ${rand.number(6, 8)}${rand.number(1000, 9999)}${rand.number(1000, 9999)}`;
  const address = `Calle ${rand.number(1, 45)}, ${barrio}, ${canton}, San José`;
  const yearsOnLand = rand.number(1, 32);

  const memberLines = [];
  memberLines.push(`${fullName} (${rand.number(26, 58)} años)`);
  for (let i = 1; i < householdSize; i += 1) {
    const memberName = `${rand.pick(firstNames)} ${rand.pick(lastNames)}`;
    const isMinor = i <= minors;
    const age = isMinor ? rand.number(1, 17) : rand.number(18, 75);
    memberLines.push(`${memberName} (${age} años)`);
  }

  return {
    index,
    fullName,
    householdSize,
    minors,
    canton,
    barrio,
    occupation,
    nationalId,
    phone,
    address,
    yearsOnLand,
    memberLines,
    signatureDate: isoDate(new Date()),
    landSituationSeed: rand.chance(0.62)
      ? "propio_con_documentacion"
      : "asentamiento_sin_documentos",
    housingNeedNarrative:
      "Familia referida por YWAM San José. Necesita mejora de vivienda por condiciones estructurales y riesgo durante temporada de lluvia.",
  };
}

function pickOption(question, preferredValue, rand) {
  if (!question.options?.length) return null;
  if (preferredValue) {
    const found = question.options.find((opt) => opt.option_value === preferredValue);
    if (found) return found;
  }
  return rand.pick(question.options);
}

function buildAnswerForQuestion({ question, profile, submittedAt, rand }) {
  const key = question.question_key;

  if (question.input_type === "select" || question.input_type === "radio") {
    const preferred = key === "situacion_terreno" ? profile.landSituationSeed : null;
    const selected = pickOption(question, preferred, rand);
    return {
      option_id: selected?.id || null,
      answer_text: selected?.option_value || null,
      answer_number: null,
      answer_boolean: null,
    };
  }

  if (question.input_type === "number") {
    let value = rand.number(1, 10);
    if (key === "numero_total_miembros") value = profile.householdSize;
    if (key === "numero_menores_edad") value = profile.minors;
    if (key === "anios_en_terreno") value = profile.yearsOnLand;

    return {
      option_id: null,
      answer_text: String(value),
      answer_number: value,
      answer_boolean: null,
    };
  }

  if (question.input_type === "date") {
    const value = key === "fecha_firma" ? isoDate(new Date(submittedAt)) : profile.signatureDate;
    return {
      option_id: null,
      answer_text: value,
      answer_number: null,
      answer_boolean: null,
    };
  }

  if (question.input_type === "file") {
    return {
      option_id: null,
      answer_text: `mock://ywam-san-jose/${question.question_key}-${profile.index}.jpg`,
      answer_number: null,
      answer_boolean: null,
    };
  }

  const textByKey = {
    nombre_jefe_familia: profile.fullName,
    documento_identificacion: profile.nationalId,
    nacionalidad: "Costarricense",
    ocupacion_actual: profile.occupation,
    detalle_miembros_familia: profile.memberLines.join(", "),
    provincia: "San José",
    ciudad: profile.canton,
    barrio_comunidad: profile.barrio,
    direccion_exacta: profile.address,
    telefono_contacto: profile.phone,
    situacion_actual_necesidad_casa: profile.housingNeedNarrative,
    nombre_firma: profile.fullName,
  };

  const fallback =
    question.input_type === "textarea"
      ? "Caso registrado para demostración interna de YWAM San José."
      : `Respuesta de muestra ${profile.index}`;

  return {
    option_id: null,
    answer_text: textByKey[key] || fallback,
    answer_number: null,
    answer_boolean: null,
  };
}

async function main() {
  loadEnvFile(".env.local");

  const args = parseArgs(process.argv.slice(2));
  const count = toPositiveInt(args.count, DEFAULT_COUNT);
  const formSlug = String(args.slug || DEFAULT_FORM_SLUG);
  const seed = String(args.seed || "ywam-san-jose-mock");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase env vars. Run with: node --env-file=.env.local scripts/seed-mock-applications.mjs",
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data: form, error: formError } = await supabase
    .from("assessment_forms")
    .select("id, slug, title")
    .eq("slug", formSlug)
    .maybeSingle();

  if (formError) throw formError;
  if (!form?.id) {
    throw new Error(`Form with slug "${formSlug}" was not found.`);
  }

  const { data: questions, error: questionsError } = await supabase
    .from("assessment_questions")
    .select("id, question_key, input_type, is_required, order_index")
    .eq("form_id", form.id)
    .eq("is_active", true)
    .order("order_index", { ascending: true });

  if (questionsError) throw questionsError;
  if (!questions?.length) {
    throw new Error(`No active questions found for form "${formSlug}".`);
  }

  const questionIds = questions.map((question) => question.id);
  const { data: options, error: optionsError } = await supabase
    .from("assessment_question_options")
    .select("id, question_id, option_label, option_value, order_index")
    .in("question_id", questionIds)
    .order("order_index", { ascending: true });

  if (optionsError) throw optionsError;

  const optionsByQuestionId = new Map();
  for (const option of options || []) {
    if (!optionsByQuestionId.has(option.question_id)) {
      optionsByQuestionId.set(option.question_id, []);
    }
    optionsByQuestionId.get(option.question_id).push(option);
  }

  const enrichedQuestions = questions.map((question) => ({
    ...question,
    options: optionsByQuestionId.get(question.id) || [],
  }));

  let created = 0;
  let failed = 0;

  for (let index = 1; index <= count; index += 1) {
    const rand = buildRandom(`${seed}-${index}`);
    const profile = buildApplicantProfile(index, rand);
    const submittedAt = randomSubmittedAt(rand);
    const status = rand.weighted([
      { value: "submitted", weight: 45 },
      { value: "under_review", weight: 25 },
      { value: "approved", weight: 15 },
      { value: "denied", weight: 10 },
      { value: "waitlisted", weight: 5 },
    ]);
    const reviewedAt = status === "submitted" ? null : randomReviewedAt(submittedAt, rand);

    let createdApplicantId = null;
    let createdAssessmentId = null;

    try {
      const { data: applicant, error: applicantError } = await supabase
        .from("applicants")
        .insert({
          full_name: profile.fullName,
          phone: profile.phone,
          national_id: profile.nationalId,
          current_location: profile.address,
          household_size: profile.householdSize,
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
          status,
          submitted_at: submittedAt,
          reviewed_at: reviewedAt,
          total_score:
            status === "submitted" ? null : Number(rand.number(52, 96)).toFixed(2),
        })
        .select("id")
        .single();

      if (assessmentError) throw assessmentError;
      createdAssessmentId = assessment.id;

      const answerRows = enrichedQuestions.map((question) => {
        const answer = buildAnswerForQuestion({
          question,
          profile,
          submittedAt,
          rand,
        });

        return {
          assessment_id: assessment.id,
          question_id: question.id,
          option_id: answer.option_id,
          answer_text: answer.answer_text,
          answer_number: answer.answer_number,
          answer_boolean: answer.answer_boolean,
        };
      });

      const { error: answersError } = await supabase
        .from("assessment_answers")
        .insert(answerRows);

      if (answersError) throw answersError;

      const historyRows = [
        {
          assessment_id: assessment.id,
          from_status: null,
          to_status: "submitted",
          notes: JSON.stringify({ source: "mock_seed", city: profile.canton }),
          changed_at: submittedAt,
        },
      ];

      if (status !== "submitted") {
        historyRows.push({
          assessment_id: assessment.id,
          from_status: "submitted",
          to_status: status,
          notes: JSON.stringify({ source: "mock_seed", reviewed: true }),
          changed_at: reviewedAt,
        });
      }

      const { error: historyError } = await supabase
        .from("assessment_status_history")
        .insert(historyRows);

      if (historyError) throw historyError;
      created += 1;
    } catch (error) {
      failed += 1;
      console.error(`Failed to create mock application #${index}:`, error.message || error);

      if (createdAssessmentId) {
        await supabase.from("assessments").delete().eq("id", createdAssessmentId);
      }
      if (createdApplicantId) {
        await supabase.from("applicants").delete().eq("id", createdApplicantId);
      }
    }
  }

  console.log("");
  console.log("Mock seeding complete.");
  console.log(`Form: ${form.title} (${form.slug})`);
  console.log(`Requested: ${count}`);
  console.log(`Created: ${created}`);
  console.log(`Failed: ${failed}`);
}

main().catch((error) => {
  console.error("Mock seeding failed:", error.message || error);
  process.exit(1);
});
