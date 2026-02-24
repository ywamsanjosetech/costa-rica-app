import SectionShell from "@/components/admin/section-shell";
import StatusPill from "@/components/ui/status-pill";
import {
  DEFAULT_FORM_SLUG,
  fetchFormQuestions,
  getOrCreateFormBySlug,
  groupQuestionsBySection,
  seedTemplateQuestionsIfEmpty,
} from "@/lib/forms/dynamic-form";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import {
  createQuestionAction,
  deleteQuestionAction,
  updateQuestionAction,
} from "./actions";

const INPUT_TYPE_OPTIONS = [
  { value: "text", label: "Texto corto" },
  { value: "textarea", label: "Texto largo" },
  { value: "number", label: "Numero" },
  { value: "select", label: "Lista desplegable" },
  { value: "radio", label: "Seleccion unica" },
  { value: "date", label: "Fecha" },
  { value: "file", label: "Archivo/imagen" },
];

function isOptionType(inputType) {
  return inputType === "radio" || inputType === "select";
}

async function loadFormBuilderData() {
  const supabase = getSupabaseServiceClient();
  const form = await getOrCreateFormBySlug(supabase, DEFAULT_FORM_SLUG);
  await seedTemplateQuestionsIfEmpty(supabase, form.id);
  const questions = await fetchFormQuestions(supabase, form.id);
  const sections = groupQuestionsBySection(questions);

  return { form, sections };
}

export default async function AdminFormBuilderPage() {
  const { form, sections } = await loadFormBuilderData();

  return (
    <SectionShell
      title="Constructor de formulario"
      subtitle="Administre secciones, preguntas y opciones del formulario publico en tiempo real."
    >
      <section className="panel space-y-4 p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <StatusPill tone="blue">Formulario activo: {form.title}</StatusPill>
          <span className="text-xs uppercase tracking-[0.08em] text-ink-soft">
            slug: {form.slug}
          </span>
        </div>

        <form action={createQuestionAction} className="rounded-2xl border border-line/70 p-4">
          <p className="text-sm font-semibold text-ink">Agregar nueva pregunta</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-xs uppercase tracking-[0.08em] text-ink-soft">
                Pregunta
              </span>
              <input name="label" required className="input-lux w-full px-3 py-2 text-sm" />
            </label>
            <label className="space-y-1">
              <span className="text-xs uppercase tracking-[0.08em] text-ink-soft">
                Tipo
              </span>
              <select name="input_type" defaultValue="text" className="input-lux w-full px-3 py-2 text-sm">
                {INPUT_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-xs uppercase tracking-[0.08em] text-ink-soft">
                Seccion
              </span>
              <input
                name="section_title"
                defaultValue="General"
                className="input-lux w-full px-3 py-2 text-sm"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs uppercase tracking-[0.08em] text-ink-soft">
                Placeholder
              </span>
              <input name="placeholder" className="input-lux w-full px-3 py-2 text-sm" />
            </label>
            <label className="space-y-1 md:col-span-2">
              <span className="text-xs uppercase tracking-[0.08em] text-ink-soft">
                Opciones (separadas por coma, solo para select/radio)
              </span>
              <input
                name="options_csv"
                placeholder="Ejemplo: Soltero(a), Casado(a), Union libre"
                className="input-lux w-full px-3 py-2 text-sm"
              />
            </label>
          </div>

          <label className="mt-3 inline-flex items-center gap-2 text-sm text-ink-soft">
            <input
              type="checkbox"
              name="is_required"
              defaultChecked
              className="h-4 w-4 accent-blue"
            />
            Pregunta requerida
          </label>

          <div className="mt-4">
            <button type="submit" className="btn-primary px-4 py-2 text-sm">
              Guardar pregunta
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {sections.map((section) => (
            <article key={section.key} className="rounded-2xl border border-line/70 p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-ink-soft">{section.title}</p>
              <div className="mt-3 space-y-3">
                {section.questions.map((question) => {
                  return (
                    <form
                      key={question.id}
                      action={updateQuestionAction}
                      className="rounded-xl border border-line/70 bg-bg-elev/30 p-3"
                    >
                      <input type="hidden" name="question_id" value={question.id} />

                      <p className="text-xs uppercase tracking-[0.08em] text-ink-soft">
                        {question.key} • posicion {question.orderIndex}
                      </p>

                      <div className="mt-2 grid gap-3 md:grid-cols-2">
                        <label className="space-y-1">
                          <span className="text-xs uppercase tracking-[0.08em] text-ink-soft">
                            Pregunta
                          </span>
                          <input
                            name="label"
                            defaultValue={question.label}
                            required
                            className="input-lux w-full px-3 py-2 text-sm"
                          />
                        </label>
                        <label className="space-y-1">
                          <span className="text-xs uppercase tracking-[0.08em] text-ink-soft">
                            Tipo
                          </span>
                          <select
                            name="input_type"
                            defaultValue={question.inputType}
                            className="input-lux w-full px-3 py-2 text-sm"
                          >
                            {INPUT_TYPE_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="space-y-1">
                          <span className="text-xs uppercase tracking-[0.08em] text-ink-soft">
                            Seccion
                          </span>
                          <input
                            name="section_title"
                            defaultValue={question.sectionTitle}
                            className="input-lux w-full px-3 py-2 text-sm"
                          />
                        </label>
                        <label className="space-y-1">
                          <span className="text-xs uppercase tracking-[0.08em] text-ink-soft">
                            Placeholder
                          </span>
                          <input
                            name="placeholder"
                            defaultValue={question.placeholder}
                            className="input-lux w-full px-3 py-2 text-sm"
                          />
                        </label>
                        <label className="space-y-1 md:col-span-2">
                          <span className="text-xs uppercase tracking-[0.08em] text-ink-soft">
                            Opciones (separadas por coma)
                          </span>
                          <input
                            name="options_csv"
                            defaultValue={question.options.map((item) => item.label).join(", ")}
                            className="input-lux w-full px-3 py-2 text-sm"
                            placeholder={
                              isOptionType(question.inputType)
                                ? "Ejemplo: Opcion A, Opcion B, Opcion C"
                                : "No aplica para este tipo"
                            }
                          />
                        </label>
                      </div>

                      <label className="mt-3 inline-flex items-center gap-2 text-sm text-ink-soft">
                        <input
                          type="checkbox"
                          name="is_required"
                          defaultChecked={question.isRequired}
                          className="h-4 w-4 accent-blue"
                        />
                        Pregunta requerida
                      </label>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <button type="submit" className="btn-primary px-4 py-2 text-xs">
                          Actualizar
                        </button>
                        <button
                          type="submit"
                          formAction={deleteQuestionAction}
                          className="btn-secondary px-4 py-2 text-xs"
                        >
                          Eliminar
                        </button>
                      </div>
                    </form>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      </section>
    </SectionShell>
  );
}
