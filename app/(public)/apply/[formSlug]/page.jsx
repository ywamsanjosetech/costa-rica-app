import {
  fetchFormQuestions,
  getOrCreateFormBySlug,
  groupQuestionsBySection,
  seedTemplateQuestionsIfEmpty,
} from "@/lib/forms/dynamic-form";
import FormAccessGate from "@/components/public/form-access-gate";
import FormStartedAtInput from "@/components/ui/form-started-at-input";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

function renderInput(question) {
  const inputName = `q__${question.key}`;
  const required = question.isRequired;
  const baseInputClass = "input-lux w-full px-3 py-2.5 text-sm";

  if (question.inputType === "textarea") {
    return (
      <textarea
        id={inputName}
        name={inputName}
        rows={4}
        required={required}
        className={baseInputClass}
        placeholder={question.placeholder || "Escriba su respuesta"}
      />
    );
  }

  if (question.inputType === "select") {
    return (
      <select id={inputName} name={inputName} required={required} className={baseInputClass}>
        <option value="">Seleccione una opcion</option>
        {question.options.map((option) => (
          <option key={option.id} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (question.inputType === "radio") {
    return (
      <div className="space-y-2">
        {question.options.map((option) => (
          <label
            key={option.id}
            className="flex items-center gap-2 rounded-lg border border-line/70 bg-bg-elev/40 px-3 py-2 text-sm text-ink"
          >
            <input
              type="radio"
              name={inputName}
              value={option.value}
              required={required}
              className="h-4 w-4 accent-blue"
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    );
  }

  if (question.inputType === "file") {
    return (
      <div className="space-y-2">
        <input
          id={inputName}
          type="file"
          name={inputName}
          required={required}
          accept="image/*"
          capture="environment"
          className={baseInputClass}
        />
        <p className="text-xs text-ink-soft">
          En celular puede tomar una foto con la camara o seleccionar una imagen.
        </p>
      </div>
    );
  }

  return (
    <input
      id={inputName}
      type={question.inputType === "number" || question.inputType === "date" ? question.inputType : "text"}
      name={inputName}
      required={required}
      min={question.inputType === "number" ? "0" : undefined}
      step={question.inputType === "number" ? "1" : undefined}
      className={baseInputClass}
      placeholder={question.placeholder || "Escriba su respuesta"}
    />
  );
}

export default async function PublicAssessmentFormPage({ params }) {
  const { formSlug } = await params;
  const supabase = getSupabaseServiceClient();
  const form = await getOrCreateFormBySlug(supabase, formSlug);
  await seedTemplateQuestionsIfEmpty(supabase, form.id);
  const questions = await fetchFormQuestions(supabase, form.id);
  const sections = groupQuestionsBySection(questions);

  return (
    <main className="space-y-6 animate-rise">
      <header className="panel-strong p-6 md:p-8">
        <p className="chip">Formulario publico</p>
        <h1 className="mt-4 text-3xl font-semibold md:text-4xl">
          <span className="text-gradient">{form.title}</span>
        </h1>
        {form.description ? (
          <p className="mt-3 max-w-3xl text-sm text-ink-soft">{form.description}</p>
        ) : null}
      </header>

      <FormAccessGate>
        <section className="panel border-line-strong/60 bg-[linear-gradient(160deg,rgba(34,58,97,0.86),rgba(18,38,70,0.82))] p-6 md:p-8">
          <form
            className="space-y-6"
            action="/api/assessments"
            method="post"
            encType="multipart/form-data"
          >
            <input type="hidden" name="form_slug" value={form.slug} />
            <FormStartedAtInput />
            <input
              type="text"
              name="company"
              autoComplete="off"
              tabIndex={-1}
              className="hidden"
              aria-hidden="true"
            />

            {sections.map((section, sectionIndex) => (
              <fieldset
                key={section.key}
                className="space-y-4 rounded-2xl border border-line/70 bg-bg-elev/40 p-4 md:p-5"
              >
                <legend className="px-2 text-base font-semibold uppercase tracking-[0.08em] text-ink">
                  Seccion {sectionIndex + 1}: {section.title}
                </legend>
                <div className="grid gap-4 md:grid-cols-2">
                  {section.questions.map((question) => (
                    <label
                      key={question.id}
                      className={`space-y-2 ${question.inputType === "textarea" || question.inputType === "radio" ? "md:col-span-2" : ""}`}
                    >
                      <span className="text-sm font-medium text-ink">
                        {question.orderIndex}. {question.label}
                        {question.isRequired ? " *" : ""}
                      </span>
                      {renderInput(question)}
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}

            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-xs text-ink-soft">
                Protegido con validacion server-side y control anti-spam.
              </p>
              <button type="submit" className="btn-primary px-6 py-3 text-sm">
                Enviar formulario
              </button>
            </div>
          </form>
        </section>
      </FormAccessGate>
    </main>
  );
}
