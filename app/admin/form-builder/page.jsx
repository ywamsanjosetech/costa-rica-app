import AdminToast from "@/components/admin/admin-toast";
import QuestionAccordionList from "@/components/admin/question-accordion-list";
import SectionShell from "@/components/admin/section-shell";
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
  reorderSectionQuestionsAction,
  renameSectionAction,
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

async function loadFormBuilderData() {
  const supabase = getSupabaseServiceClient();
  const form = await getOrCreateFormBySlug(supabase, DEFAULT_FORM_SLUG);
  await seedTemplateQuestionsIfEmpty(supabase, form.id);
  const questions = await fetchFormQuestions(supabase, form.id);
  const sections = groupQuestionsBySection(questions);

  return { form, sections };
}

export default async function AdminFormBuilderPage({ searchParams }) {
  const { form, sections } = await loadFormBuilderData();
  const resolvedSearchParams = (await searchParams) || {};
  const noticeCode = Array.isArray(resolvedSearchParams.notice)
    ? resolvedSearchParams.notice[0]
    : resolvedSearchParams.notice;
  const deletedItem = Array.isArray(resolvedSearchParams.deleted_item)
    ? resolvedSearchParams.deleted_item[0]
    : resolvedSearchParams.deleted_item;
  const createdItem = Array.isArray(resolvedSearchParams.created_item)
    ? resolvedSearchParams.created_item[0]
    : resolvedSearchParams.created_item;
  const noticeMessage =
    noticeCode === "section-updated"
      ? "Seccion actualizada."
      : noticeCode === "question-created"
        ? createdItem
          ? `Nueva "${createdItem}" agregada.`
          : "Nueva pregunta agregada."
      : noticeCode === "question-deleted"
        ? deletedItem
          ? `Pregunta "${deletedItem}" eliminada.`
          : "Pregunta eliminada."
        : null;

  return (
    <SectionShell
      title="Constructor de formulario"
      subtitle="Administre secciones, preguntas y opciones del formulario publico en tiempo real."
    >
      <AdminToast message={noticeMessage} />
      <section className="panel space-y-4 p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-end gap-3">
          <span className="text-xs uppercase tracking-[0.08em] text-ink-soft">
            slug: {form.slug}
          </span>
        </div>

        <div className="space-y-4">
          {sections.map((section, sectionIndex) => (
            <details
              key={section.key}
              className="form-builder-section-panel group rounded-2xl border border-line/70"
            >
              <summary className="form-builder-section-summary flex cursor-pointer items-center justify-between gap-3 px-4 py-4 marker:content-none md:px-5">
                <p className="text-sm font-semibold uppercase tracking-[0.08em] text-ink">
                  Seccion {sectionIndex + 1}: {section.title}
                </p>
                <span className="text-xs uppercase tracking-[0.08em] text-ink-soft">
                  {section.questions.length} preguntas
                </span>
              </summary>

              <div className="space-y-3 border-t border-line/70 p-4 md:p-5">
                <form
                  action={renameSectionAction}
                  className="form-builder-subpanel rounded-xl border border-line/70 p-3 md:p-4"
                >
                  <input type="hidden" name="section_key" value={section.key} />
                  <div className="flex flex-wrap items-end gap-3">
                    <label className="min-w-0 flex-1 space-y-1">
                      <span className="text-xs uppercase tracking-[0.08em] text-ink-soft">
                        Nombre de seccion
                      </span>
                      <input
                        name="section_title"
                        required
                        defaultValue={section.title}
                        className="input-lux w-full px-3 py-2 text-sm"
                      />
                    </label>
                    <button type="submit" className="btn-secondary px-4 py-2 text-xs">
                      Guardar seccion
                    </button>
                  </div>
                </form>

                <form
                  action={createQuestionAction}
                  className="form-builder-subpanel rounded-xl border border-line/70 p-3 md:p-4"
                >
                  <input type="hidden" name="section_key" value={section.key} />
                  <input type="hidden" name="section_title" value={section.title} />
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">
                    Agregar pregunta en esta seccion
                  </p>
                  <div className="mt-3 grid gap-2 md:grid-cols-12">
                    <label className="space-y-1 md:col-span-5">
                      <span className="text-[11px] uppercase tracking-[0.08em] text-ink-soft">
                        Pregunta
                      </span>
                      <input name="label" required className="input-lux w-full px-3 py-2 text-sm" />
                    </label>
                    <label className="space-y-1 md:col-span-3">
                      <span className="text-[11px] uppercase tracking-[0.08em] text-ink-soft">
                        Tipo
                      </span>
                      <select
                        name="input_type"
                        defaultValue="text"
                        className="input-lux w-full px-3 py-2 text-sm"
                      >
                        {INPUT_TYPE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-1 md:col-span-4">
                      <span className="text-[11px] uppercase tracking-[0.08em] text-ink-soft">
                        Placeholder
                      </span>
                      <input name="placeholder" className="input-lux w-full px-3 py-2 text-sm" />
                    </label>
                    <label className="space-y-1 md:col-span-12">
                      <span className="text-[11px] uppercase tracking-[0.08em] text-ink-soft">
                        Opciones (solo select/radio)
                      </span>
                      <input
                        name="options_csv"
                        placeholder="Ejemplo: Opcion A, Opcion B, Opcion C"
                        className="input-lux w-full px-3 py-2 text-sm"
                      />
                    </label>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <label className="inline-flex items-center gap-2 text-xs text-ink-soft">
                      <input
                        type="checkbox"
                        name="is_required"
                        defaultChecked
                        className="h-4 w-4 accent-blue"
                      />
                      Requerida
                    </label>
                    <button type="submit" className="btn-primary px-4 py-2 text-xs">
                      Guardar pregunta
                    </button>
                  </div>
                </form>

                <QuestionAccordionList
                  sectionKey={section.key}
                  sectionTitle={section.title}
                  questions={section.questions}
                  inputTypeOptions={INPUT_TYPE_OPTIONS}
                  updateQuestionAction={updateQuestionAction}
                  deleteQuestionAction={deleteQuestionAction}
                  reorderSectionQuestionsAction={reorderSectionQuestionsAction}
                />
              </div>
            </details>
          ))}
        </div>
      </section>
    </SectionShell>
  );
}
