import SectionShell from "@/components/admin/section-shell";
import StatusPill from "@/components/ui/status-pill";
import { fetchAssessmentSummaries } from "@/lib/admin/assessments";

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

export default async function AdminSubmissionsPage() {
  let rows = [];
  let errorMessage = null;

  try {
    rows = await fetchAssessmentSummaries();
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? `No se pudieron cargar las solicitudes: ${error.message}`
        : "No se pudieron cargar las solicitudes.";
  }

  return (
    <SectionShell
      title="Solicitudes"
      subtitle="Cola para revisión de solicitantes, puntaje y flujo de decisión de vivienda."
    >
      <section className="panel p-3">
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
                <tr key={row.id} className="border-b border-line/70">
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

        {errorMessage ? (
          <p className="mt-3 rounded-xl border border-rose-400/40 bg-rose-400/10 px-3 py-2 text-xs text-rose-200">
            {errorMessage}
          </p>
        ) : null}
      </section>
    </SectionShell>
  );
}
