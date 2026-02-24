"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import DeleteQuestionControls from "@/components/admin/delete-question-controls";

function isOptionType(inputType) {
  return inputType === "radio" || inputType === "select";
}

export default function QuestionAccordionList({
  sectionKey,
  sectionTitle,
  questions,
  inputTypeOptions,
  updateQuestionAction,
  deleteQuestionAction,
  reorderSectionQuestionsAction,
}) {
  const [orderedQuestions, setOrderedQuestions] = useState(questions);
  const [draggedId, setDraggedId] = useState(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setOrderedQuestions(questions);
  }, [questions]);

  const questionNameGroup = useMemo(() => `section-${sectionKey}-questions`, [sectionKey]);

  const persistReorder = (nextQuestions) => {
    const formData = new FormData();
    formData.set("section_key", sectionKey);
    formData.set(
      "ordered_ids",
      nextQuestions.map((question) => question.id).join(","),
    );

    startTransition(async () => {
      await reorderSectionQuestionsAction(formData);
    });
  };

  const moveDraggedQuestionBefore = (targetId) => {
    if (!draggedId || draggedId === targetId) return;

    const fromIndex = orderedQuestions.findIndex((question) => question.id === draggedId);
    const targetIndex = orderedQuestions.findIndex((question) => question.id === targetId);
    if (fromIndex < 0 || targetIndex < 0) return;

    const nextQuestions = [...orderedQuestions];
    const [draggedQuestion] = nextQuestions.splice(fromIndex, 1);
    nextQuestions.splice(targetIndex, 0, draggedQuestion);

    setOrderedQuestions(nextQuestions);
    persistReorder(nextQuestions);
    setDraggedId(null);
  };

  return (
    <div className="space-y-2">
      {orderedQuestions.map((question, index) => (
        <div
          key={question.id}
          draggable={!isPending}
          onDragStart={() => setDraggedId(question.id)}
          onDragEnd={() => setDraggedId(null)}
          onDragOver={(event) => {
            event.preventDefault();
          }}
          onDrop={() => moveDraggedQuestionBefore(question.id)}
          className={`transition-opacity ${draggedId === question.id ? "opacity-55" : "opacity-100"} ${isPending ? "cursor-progress" : ""}`}
        >
          <details name={questionNameGroup} className="form-builder-question-collapsible rounded-xl border border-line/70">
            <summary className="form-builder-question-summary flex items-center justify-between gap-3 px-4 py-3 marker:content-none">
              <div className="flex items-center gap-2">
                <span
                  className="cursor-grab select-none text-xs tracking-[0.08em] text-ink-soft/90 active:cursor-grabbing"
                  title="Arrastre para reordenar"
                  aria-hidden
                >
                  ⋮⋮
                </span>
                <p className="text-sm font-bold uppercase tracking-[0.08em] text-ink">
                  {index + 1}. {question.key}
                </p>
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft">
                Editar
              </span>
            </summary>

            <form action={updateQuestionAction} className="space-y-2 border-t border-line/70 p-3">
              <input type="hidden" name="question_id" value={question.id} />
              <input type="hidden" name="section_key" value={sectionKey} />
              <input type="hidden" name="section_title" value={sectionTitle} />

              <div className="grid gap-2 md:grid-cols-12">
                <label className="space-y-1 md:col-span-5">
                  <span className="text-[11px] uppercase tracking-[0.08em] text-ink-soft">
                    Pregunta
                  </span>
                  <input
                    name="label"
                    required
                    defaultValue={question.label}
                    className="input-lux w-full px-3 py-2 text-sm"
                  />
                </label>
                <label className="space-y-1 md:col-span-3">
                  <span className="text-[11px] uppercase tracking-[0.08em] text-ink-soft">
                    Tipo
                  </span>
                  <select
                    name="input_type"
                    defaultValue={question.inputType}
                    className="input-lux w-full px-3 py-2 text-sm"
                  >
                    {inputTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1 md:col-span-3">
                  <span className="text-[11px] uppercase tracking-[0.08em] text-ink-soft">
                    Placeholder
                  </span>
                  <input
                    name="placeholder"
                    defaultValue={question.placeholder}
                    className="input-lux w-full px-3 py-2 text-sm"
                  />
                </label>
                <label className="flex items-center gap-2 text-xs text-ink-soft md:col-span-1 md:self-end md:pb-2">
                  <input
                    type="checkbox"
                    name="is_required"
                    defaultChecked={question.isRequired}
                    className="h-4 w-4 accent-blue"
                  />
                  Req.
                </label>
              </div>

              <div className="mt-2 grid gap-2 md:grid-cols-12">
                <label className="space-y-1 md:col-span-9">
                  <span className="text-[11px] uppercase tracking-[0.08em] text-ink-soft">
                    Opciones (coma separada)
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
                <div className="flex items-end justify-end gap-2 md:col-span-3">
                  <button type="submit" className="btn-primary px-3 py-2 text-xs">
                    Actualizar
                  </button>
                  <DeleteQuestionControls deleteQuestionAction={deleteQuestionAction} />
                </div>
              </div>
            </form>
          </details>
        </div>
      ))}
    </div>
  );
}
