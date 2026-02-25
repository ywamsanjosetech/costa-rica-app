"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  deleteSubmissionAction,
  getSubmissionDetailAction,
  updateSubmissionAction,
} from "@/app/admin/submissions/actions";
import StatusPill from "@/components/ui/status-pill";

const STATUS_OPTIONS = [
  { value: "submitted", label: "Pendiente", tone: "pink" },
  { value: "under_review", label: "En revisión", tone: "blue" },
  { value: "approved", label: "Aprobado", tone: "success" },
  { value: "denied", label: "Denegado", tone: "neutral" },
  { value: "waitlisted", label: "Lista de espera", tone: "neutral" },
];

function formatDate(value) {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return date.toLocaleDateString("es-CR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "UTC",
  });
}

function toDateInputValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function toStatusTone(status) {
  return STATUS_OPTIONS.find((item) => item.value === status)?.tone || "neutral";
}

function toStatusLabel(status) {
  return STATUS_OPTIONS.find((item) => item.value === status)?.label || "Sin estado";
}

function buildDraft(row) {
  return {
    assessmentId: row.id,
    applicantId: row.applicantId,
    formId: row.formId,
    formTitle: row.formTitle,
    status: row.status || "submitted",
    score: Number.isFinite(row.score) ? String(row.score) : "",
    applicantName: row.applicantName || "",
    applicantPhone: row.applicantPhone || "",
    householdSize: Number.isFinite(row.householdSize) ? String(row.householdSize) : "",
    province: row.province || "",
    city: row.city || "",
    barrio: row.barrio || "",
    address: row.address || "",
    submittedAt: toDateInputValue(row.submittedAt),
    answers: [],
  };
}

function renderAnswerInput({ answer, onChange }) {
  const baseClass = "input-lux w-full px-3 py-2 text-sm";
  const placeholder = answer.placeholder || "Escriba su respuesta";

  if (answer.inputType === "textarea") {
    return (
      <textarea
        rows={3}
        className={baseClass}
        value={answer.value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    );
  }

  if (answer.inputType === "select" || answer.inputType === "radio") {
    return (
      <select
        className={baseClass}
        value={answer.value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Seleccione una opción</option>
        {answer.options.map((option) => (
          <option key={option.id} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (answer.inputType === "date") {
    return (
      <input
        type="date"
        className={baseClass}
        value={answer.value}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  if (answer.inputType === "number") {
    return (
      <input
        type="number"
        className={baseClass}
        value={answer.value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    );
  }

  return (
    <input
      type="text"
      className={baseClass}
      value={answer.value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
    />
  );
}

export default function SubmissionsTable({ rows = [] }) {
  const router = useRouter();
  const requestCounterRef = useRef(0);
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isPending, startTransition] = useTransition();

  const selectedRow = useMemo(
    () => rows.find((row) => row.id === selectedId) || null,
    [rows, selectedId],
  );

  const groupedAnswers = (() => {
    if (!draft?.answers?.length) return [];

    const bySection = new Map();
    const ordered = [];

    for (const answer of draft.answers) {
      const sectionKey = answer.sectionKey || "general";
      if (!bySection.has(sectionKey)) {
        const section = {
          key: sectionKey,
          title: answer.sectionTitle || "General",
          fields: [],
        };
        bySection.set(sectionKey, section);
        ordered.push(section);
      }

      bySection.get(sectionKey).fields.push(answer);
    }

    return ordered;
  })();

  const openSidebar = async (row) => {
    const requestId = requestCounterRef.current + 1;
    requestCounterRef.current = requestId;

    setSelectedId(row.id);
    setDraft(buildDraft(row));
    setShowDeleteConfirm(false);
    setFeedback(null);
    setIsLoadingDetails(true);

    const detailResult = await getSubmissionDetailAction({
      assessmentId: row.id,
      formId: row.formId,
    });

    if (requestCounterRef.current !== requestId) return;

    if (!detailResult?.ok) {
      setFeedback({
        tone: "error",
        text: detailResult?.message || "No se pudieron cargar las respuestas del formulario.",
      });
      setIsLoadingDetails(false);
      return;
    }

    setDraft((current) => {
      if (!current || current.assessmentId !== row.id) return current;
      return {
        ...current,
        answers: detailResult.questions || [],
      };
    });
    setIsLoadingDetails(false);
  };

  const closeSidebar = () => {
    requestCounterRef.current += 1;
    setSelectedId(null);
    setDraft(null);
    setShowDeleteConfirm(false);
    setFeedback(null);
    setIsLoadingDetails(false);
  };

  const handleSave = (event) => {
    event.preventDefault();
    if (!draft) return;

    startTransition(async () => {
      const result = await updateSubmissionAction(draft);
      setFeedback({
        tone: result?.ok ? "ok" : "error",
        text: result?.message || "No se pudo guardar.",
      });
      if (result?.ok) {
        router.refresh();
      }
    });
  };

  const handleDelete = () => {
    if (!draft) return;

    startTransition(async () => {
      const result = await deleteSubmissionAction({
        assessmentId: draft.assessmentId,
        applicantId: draft.applicantId,
      });

      if (result?.ok) {
        closeSidebar();
        router.refresh();
        return;
      }

      setFeedback({
        tone: "error",
        text: result?.message || "No se pudo eliminar.",
      });
    });
  };

  const updateAnswer = (questionId, value) => {
    setDraft((current) => {
      if (!current) return current;
      return {
        ...current,
        answers: current.answers.map((answer) =>
          answer.questionId === questionId ? { ...answer, value } : answer,
        ),
      };
    });
  };

  const sidebarContent =
    selectedRow && draft ? (
      <div className="fixed inset-0 z-[120]">
        <button
          type="button"
          aria-label="Cerrar panel"
          onClick={closeSidebar}
          className="absolute inset-0 bg-[#020814]/78 backdrop-blur-[1px]"
        />

        <aside className="fixed inset-y-0 right-0 h-full w-full max-w-[620px] overflow-auto border-l border-line-strong bg-[linear-gradient(160deg,rgba(15,31,56,0.98),rgba(7,19,37,0.97))] p-5 shadow-[-22px_0_52px_-28px_rgba(0,0,0,0.9)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.09em] text-ink-soft">
                Solicitud seleccionada
              </p>
              <h3 className="mt-1 text-2xl font-semibold text-ink">
                {draft.applicantName || "Solicitante"}
              </h3>
            </div>

            <button
              type="button"
              onClick={closeSidebar}
              className="btn-secondary px-3 py-2 text-xs"
            >
              Cerrar
            </button>
          </div>

          <form onSubmit={handleSave} className="mt-5 space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs uppercase tracking-[0.08em] text-ink-soft">
                  Solicitante
                </span>
                <input
                  className="input-lux w-full px-3 py-2 text-sm"
                  value={draft.applicantName}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      applicantName: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs uppercase tracking-[0.08em] text-ink-soft">
                  Teléfono
                </span>
                <input
                  className="input-lux w-full px-3 py-2 text-sm"
                  value={draft.applicantPhone}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      applicantPhone: event.target.value,
                    }))
                  }
                />
              </label>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <label className="space-y-1">
                <span className="text-xs uppercase tracking-[0.08em] text-ink-soft">
                  Estado
                </span>
                <select
                  className="input-lux w-full px-3 py-2 text-sm"
                  value={draft.status}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      status: event.target.value,
                    }))
                  }
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-xs uppercase tracking-[0.08em] text-ink-soft">
                  Puntaje
                </span>
                <input
                  type="number"
                  className="input-lux w-full px-3 py-2 text-sm"
                  value={draft.score}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      score: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs uppercase tracking-[0.08em] text-ink-soft">
                  Miembros hogar
                </span>
                <input
                  type="number"
                  min="0"
                  className="input-lux w-full px-3 py-2 text-sm"
                  value={draft.householdSize}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      householdSize: event.target.value,
                    }))
                  }
                />
              </label>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <label className="space-y-1">
                <span className="text-xs uppercase tracking-[0.08em] text-ink-soft">
                  Provincia
                </span>
                <input
                  className="input-lux w-full px-3 py-2 text-sm"
                  value={draft.province}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      province: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs uppercase tracking-[0.08em] text-ink-soft">
                  Ciudad
                </span>
                <input
                  className="input-lux w-full px-3 py-2 text-sm"
                  value={draft.city}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      city: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs uppercase tracking-[0.08em] text-ink-soft">
                  Barrio / comunidad
                </span>
                <input
                  className="input-lux w-full px-3 py-2 text-sm"
                  value={draft.barrio}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      barrio: event.target.value,
                    }))
                  }
                />
              </label>
            </div>

            <label className="block space-y-1">
              <span className="text-xs uppercase tracking-[0.08em] text-ink-soft">
                Dirección
              </span>
              <textarea
                rows={3}
                className="input-lux w-full px-3 py-2 text-sm"
                value={draft.address}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    address: event.target.value,
                  }))
                }
              />
            </label>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs uppercase tracking-[0.08em] text-ink-soft">
                  Fecha envío
                </span>
                <input
                  type="date"
                  className="input-lux w-full px-3 py-2 text-sm"
                  value={draft.submittedAt}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      submittedAt: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs uppercase tracking-[0.08em] text-ink-soft">
                  Formulario
                </span>
                <input
                  value={draft.formTitle || selectedRow.formTitle}
                  disabled
                  className="input-lux w-full px-3 py-2 text-sm opacity-70"
                />
              </label>
            </div>

            <section className="space-y-3 rounded-xl border border-line/70 bg-bg-elev/40 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">
                Respuestas del formulario (editable)
              </p>

              {isLoadingDetails ? (
                <p className="text-sm text-ink-soft">Cargando preguntas y respuestas...</p>
              ) : groupedAnswers.length ? (
                groupedAnswers.map((section) => (
                  <div key={section.key} className="space-y-2 rounded-xl border border-line/70 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">
                      {section.title}
                    </p>
                    <div className="grid gap-3 md:grid-cols-2">
                      {section.fields.map((answer) => (
                        <label
                          key={answer.questionId}
                          className={`space-y-1 ${
                            answer.inputType === "textarea" ? "md:col-span-2" : ""
                          }`}
                        >
                          <span className="text-[12px] font-medium text-ink">
                            {answer.label}
                            {answer.isRequired ? " *" : ""}
                          </span>
                          {renderAnswerInput({
                            answer,
                            onChange: (value) => updateAnswer(answer.questionId, value),
                          })}
                        </label>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-ink-soft">
                  No hay preguntas disponibles para este formulario.
                </p>
              )}
            </section>

            <div className="rounded-xl border border-line/70 bg-bg-elev/45 px-3 py-2 text-xs text-ink-soft">
              <p>ID solicitud: {draft.assessmentId}</p>
              <p>ID solicitante: {draft.applicantId}</p>
              <p>
                Estado actual:{" "}
                <span className="font-semibold text-ink">{toStatusLabel(draft.status)}</span>
              </p>
            </div>

            {feedback ? (
              <p
                className={`rounded-xl border px-3 py-2 text-xs ${
                  feedback.tone === "ok"
                    ? "border-teal/55 bg-teal/15 text-teal"
                    : "border-rose-400/45 bg-rose-400/12 text-rose-200"
                }`}
              >
                {feedback.text}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="inline-flex items-center gap-2">
                <StatusPill tone={toStatusTone(draft.status)}>
                  {toStatusLabel(draft.status)}
                </StatusPill>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {!showDeleteConfirm ? (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => setShowDeleteConfirm(true)}
                    className="btn-danger-ghost px-3 py-2 text-xs"
                  >
                    Eliminar
                  </button>
                ) : (
                  <div className="flex items-center gap-2 rounded-xl border border-rose-400/45 bg-rose-500/10 px-2 py-1.5 text-xs text-rose-100">
                    <span>¿Seguro que desea eliminar?</span>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="btn-secondary px-2 py-1 text-[11px]"
                      disabled={isPending}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="btn-danger px-2 py-1 text-[11px]"
                      disabled={isPending}
                    >
                      Sí, eliminar
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isPending || isLoadingDetails}
                  className="btn-primary px-4 py-2 text-xs"
                >
                  {isPending ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </div>
          </form>
        </aside>
      </div>
    ) : null;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/70 px-2 py-2 text-xs uppercase tracking-[0.09em] text-ink-soft">
        <p>Solicitudes registradas: {rows.length}</p>
        <p>Mostrando todos los registros en base de datos</p>
      </div>

      <div className="mt-2 overflow-auto rounded-xl border border-line/70">
        <table className="min-w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-bg-base/95 backdrop-blur">
            <tr className="border-b border-line text-xs uppercase tracking-[0.09em] text-ink-soft">
              <th className="px-3 py-3">Solicitante</th>
              <th className="px-3 py-3">Estado</th>
              <th className="px-3 py-3">Puntaje</th>
              <th className="px-3 py-3">Formulario</th>
              <th className="px-3 py-3">Provincia</th>
              <th className="px-3 py-3">Enviado</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => openSidebar(row)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openSidebar(row);
                  }
                }}
                tabIndex={0}
                className="cursor-pointer border-b border-line/70 transition-colors hover:bg-blue/10 focus-visible:bg-blue/12 focus-visible:outline-none"
              >
                <td className="px-3 py-3 font-medium text-ink">{row.applicantName}</td>
                <td className="px-3 py-3">
                  <StatusPill tone={row.statusTone}>{row.statusLabel}</StatusPill>
                </td>
                <td className="px-3 py-3 text-ink">
                  {Number.isFinite(row.score) ? row.score : "Sin puntaje"}
                </td>
                <td className="px-3 py-3 text-ink-soft">{row.formTitle}</td>
                <td className="px-3 py-3 text-ink-soft">{row.province}</td>
                <td className="px-3 py-3 text-ink-soft">{formatDate(row.submittedAt)}</td>
              </tr>
            ))}
            {!rows.length ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-sm text-ink-soft">
                  No hay solicitudes para mostrar.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {typeof document !== "undefined" && sidebarContent
        ? createPortal(sidebarContent, document.body)
        : null}
    </>
  );
}
