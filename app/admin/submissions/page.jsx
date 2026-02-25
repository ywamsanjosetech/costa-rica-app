import SectionShell from "@/components/admin/section-shell";
import SubmissionsTable from "@/components/admin/submissions-table";
import { fetchAssessmentSummaries } from "@/lib/admin/assessments";

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
        <SubmissionsTable rows={rows} />

        {errorMessage ? (
          <p className="mt-3 rounded-xl border border-rose-400/40 bg-rose-400/10 px-3 py-2 text-xs text-rose-200">
            {errorMessage}
          </p>
        ) : null}
      </section>
    </SectionShell>
  );
}
