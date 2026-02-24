export const DEFAULT_FORM_SLUG = "housing-relief-2026";

const DEFAULT_FORM_TITLE = "Formulario de Informacion Familiar y Vivienda";
const DEFAULT_FORM_DESCRIPTION =
  "Complete cada seccion con informacion clara para evaluar su solicitud de vivienda.";

const DEFAULT_TEMPLATE_QUESTIONS = [
  {
    question_key: "nombre_jefe_familia",
    label: "Nombre del jefe de familia",
    input_type: "text",
    is_required: true,
    section_key: "informacion_familiar",
    section_title: "Informacion Familiar y Vivienda",
    placeholder: "Escriba el nombre completo",
  },
  {
    question_key: "documento_identificacion",
    label: "Cedula o documento de identificacion",
    input_type: "text",
    is_required: true,
    section_key: "informacion_familiar",
    section_title: "Informacion Familiar y Vivienda",
    placeholder: "Ingrese numero de documento",
  },
  {
    question_key: "nacionalidad",
    label: "Nacionalidad",
    input_type: "text",
    is_required: true,
    section_key: "informacion_familiar",
    section_title: "Informacion Familiar y Vivienda",
  },
  {
    question_key: "estado_civil",
    label: "Estado civil",
    input_type: "select",
    is_required: true,
    section_key: "informacion_familiar",
    section_title: "Informacion Familiar y Vivienda",
    options: [
      { option_label: "Soltero(a)", option_value: "soltero" },
      { option_label: "Casado(a)", option_value: "casado" },
      { option_label: "Union libre", option_value: "union_libre" },
      { option_label: "Divorciado(a)", option_value: "divorciado" },
      { option_label: "Viudo(a)", option_value: "viudo" },
    ],
  },
  {
    question_key: "ocupacion_actual",
    label: "Ocupacion actual",
    input_type: "text",
    is_required: true,
    section_key: "informacion_familiar",
    section_title: "Informacion Familiar y Vivienda",
  },
  {
    question_key: "numero_total_miembros",
    label: "Numero total de miembros en la familia",
    input_type: "number",
    is_required: true,
    section_key: "informacion_familiar",
    section_title: "Informacion Familiar y Vivienda",
  },
  {
    question_key: "numero_menores_edad",
    label: "Numero de menores de edad",
    input_type: "number",
    is_required: true,
    section_key: "informacion_familiar",
    section_title: "Informacion Familiar y Vivienda",
  },
  {
    question_key: "detalle_miembros_familia",
    label: "Escriba el nombre completo y edad de cada miembro familiar",
    input_type: "textarea",
    is_required: true,
    section_key: "informacion_familiar",
    section_title: "Informacion Familiar y Vivienda",
  },
  {
    question_key: "provincia",
    label: "Provincia",
    input_type: "text",
    is_required: true,
    section_key: "direccion",
    section_title: "Direccion",
  },
  {
    question_key: "ciudad",
    label: "Ciudad",
    input_type: "text",
    is_required: true,
    section_key: "direccion",
    section_title: "Direccion",
  },
  {
    question_key: "barrio_comunidad",
    label: "Barrio / Comunidad",
    input_type: "text",
    is_required: true,
    section_key: "direccion",
    section_title: "Direccion",
  },
  {
    question_key: "direccion_exacta",
    label: "Direccion exacta",
    input_type: "textarea",
    is_required: true,
    section_key: "direccion",
    section_title: "Direccion",
  },
  {
    question_key: "telefono_contacto",
    label: "Telefono",
    input_type: "text",
    is_required: true,
    section_key: "direccion",
    section_title: "Direccion",
    placeholder: "+506 ...",
  },
  {
    question_key: "situacion_terreno",
    label: "El terreno donde vive es",
    input_type: "radio",
    is_required: true,
    section_key: "situacion_terreno",
    section_title: "Situacion del Terreno",
    options: [
      {
        option_label: "Propio y cuenta con documentacion",
        option_value: "propio_con_documentacion",
      },
      {
        option_label: "Asentamiento que no cuenta con documentos",
        option_value: "asentamiento_sin_documentos",
      },
    ],
  },
  {
    question_key: "anios_en_terreno",
    label: "Cuantos anos lleva viviendo en ese terreno",
    input_type: "number",
    is_required: true,
    section_key: "situacion_terreno",
    section_title: "Situacion del Terreno",
  },
  {
    question_key: "situacion_actual_necesidad_casa",
    label:
      "Por favor conteste de forma especifica y breve cual es su situacion actual y por que necesita una casa",
    input_type: "textarea",
    is_required: true,
    section_key: "situacion_vivienda",
    section_title: "Situacion de Vivienda",
  },
  {
    question_key: "foto_casa_actual",
    label: "Foto de la casa actual",
    input_type: "file",
    is_required: true,
    section_key: "registro_fotografico",
    section_title: "Registro Fotografico",
    placeholder: "Adjuntar imagen aqui",
  },
  {
    question_key: "foto_familia",
    label: "Foto de la familia",
    input_type: "file",
    is_required: true,
    section_key: "registro_fotografico",
    section_title: "Registro Fotografico",
    placeholder: "Adjuntar imagen aqui",
  },
  {
    question_key: "nombre_firma",
    label: "Nombre",
    input_type: "text",
    is_required: true,
    section_key: "datos_finales",
    section_title: "Datos Finales",
  },
  {
    question_key: "fecha_firma",
    label: "Fecha",
    input_type: "date",
    is_required: true,
    section_key: "datos_finales",
    section_title: "Datos Finales",
  },
];

function normalizeSlug(slug) {
  return decodeURIComponent(String(slug || DEFAULT_FORM_SLUG).trim()) || DEFAULT_FORM_SLUG;
}

export function toSlugKey(value, fallback = "general") {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return normalized || fallback;
}

export function encodeQuestionMeta(meta = {}) {
  const clean = {
    sectionKey: String(meta.sectionKey || "general").trim() || "general",
    sectionTitle: String(meta.sectionTitle || "General").trim() || "General",
    placeholder: String(meta.placeholder || "").trim(),
  };

  return JSON.stringify(clean);
}

export function parseQuestionMeta(helpText) {
  if (!helpText) {
    return {
      sectionKey: "general",
      sectionTitle: "General",
      placeholder: "",
    };
  }

  try {
    const parsed = JSON.parse(helpText);
    return {
      sectionKey: String(parsed.sectionKey || "general"),
      sectionTitle: String(parsed.sectionTitle || "General"),
      placeholder: String(parsed.placeholder || ""),
    };
  } catch {
    return {
      sectionKey: "general",
      sectionTitle: "General",
      placeholder: "",
    };
  }
}

export function groupQuestionsBySection(questions) {
  const ordered = [];
  const byKey = new Map();

  for (const question of questions) {
    const sectionKey = question.sectionKey || "general";
    if (!byKey.has(sectionKey)) {
      const section = {
        key: sectionKey,
        title: question.sectionTitle || "General",
        questions: [],
      };
      byKey.set(sectionKey, section);
      ordered.push(section);
    }

    byKey.get(sectionKey).questions.push(question);
  }

  return ordered;
}

export async function getOrCreateFormBySlug(supabase, rawSlug) {
  const slug = normalizeSlug(rawSlug);

  const { data: existingForm, error: findError } = await supabase
    .from("assessment_forms")
    .select("id, slug, title, description, is_active")
    .eq("slug", slug)
    .maybeSingle();

  if (findError) throw findError;
  if (existingForm?.id) return existingForm;

  const { data: created, error: createError } = await supabase
    .from("assessment_forms")
    .insert({
      slug,
      title: DEFAULT_FORM_TITLE,
      description: DEFAULT_FORM_DESCRIPTION,
      is_active: true,
    })
    .select("id, slug, title, description, is_active")
    .single();

  if (createError) throw createError;
  return created;
}

export async function fetchFormQuestions(supabase, formId) {
  const { data: questions, error: questionsError } = await supabase
    .from("assessment_questions")
    .select("id, question_key, label, help_text, input_type, is_required, order_index, is_active")
    .eq("form_id", formId)
    .eq("is_active", true)
    .order("order_index", { ascending: true });

  if (questionsError) throw questionsError;
  if (!questions?.length) return [];

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
    optionsByQuestionId.get(option.question_id).push({
      id: option.id,
      label: option.option_label,
      value: option.option_value,
      orderIndex: option.order_index,
    });
  }

  return questions.map((question) => {
    const meta = parseQuestionMeta(question.help_text);
    return {
      id: question.id,
      key: question.question_key,
      label: question.label,
      inputType: question.input_type,
      isRequired: question.is_required,
      orderIndex: question.order_index,
      sectionKey: meta.sectionKey,
      sectionTitle: meta.sectionTitle,
      placeholder: meta.placeholder,
      options: optionsByQuestionId.get(question.id) || [],
    };
  });
}

export async function seedTemplateQuestionsIfEmpty(supabase, formId) {
  const { count, error: countError } = await supabase
    .from("assessment_questions")
    .select("id", { count: "exact", head: true })
    .eq("form_id", formId);

  if (countError) throw countError;
  if ((count || 0) > 0) return;

  for (let index = 0; index < DEFAULT_TEMPLATE_QUESTIONS.length; index += 1) {
    const item = DEFAULT_TEMPLATE_QUESTIONS[index];
    const { data: questionRow, error: questionError } = await supabase
      .from("assessment_questions")
      .insert({
        form_id: formId,
        question_key: item.question_key,
        label: item.label,
        help_text: encodeQuestionMeta({
          sectionKey: item.section_key,
          sectionTitle: item.section_title,
          placeholder: item.placeholder || "",
        }),
        input_type: item.input_type,
        is_required: item.is_required,
        order_index: index + 1,
        scoring_weight: 1,
        is_active: true,
      })
      .select("id")
      .single();

    if (questionError) throw questionError;
    if (!item.options?.length) continue;

    const optionRows = item.options.map((option, optionIndex) => ({
      question_id: questionRow.id,
      option_label: option.option_label,
      option_value: option.option_value,
      order_index: optionIndex + 1,
      score_value: 0,
    }));

    const { error: optionsError } = await supabase
      .from("assessment_question_options")
      .insert(optionRows);

    if (optionsError) throw optionsError;
  }
}

export function normalizeOptionList(rawValue) {
  const source = String(rawValue || "").trim();
  if (!source) return [];

  return source
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((label, index) => ({
      option_label: label,
      option_value: toSlugKey(label, `opcion_${index + 1}`).slice(0, 60),
      order_index: index + 1,
      score_value: 0,
    }));
}
