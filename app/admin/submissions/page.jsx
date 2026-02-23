import SectionShell from "@/components/admin/section-shell";
import StatusPill from "@/components/ui/status-pill";

const rows = [
  {
    applicant: "Maria Gutierrez",
    status: "Pendiente",
    score: "82",
    submittedAt: "2026-02-19",
  },
  {
    applicant: "Andres Mena",
    status: "En revision",
    score: "67",
    submittedAt: "2026-02-18",
  },
  {
    applicant: "Rosa Nunez",
    status: "Aprobado",
    score: "91",
    submittedAt: "2026-02-17",
  },
];

export default function AdminSubmissionsPage() {
  const getTone = (status) => {
    if (status === "Aprobado") return "success";
    if (status === "Pendiente") return "pink";
    if (status === "En revision") return "blue";
    return "neutral";
  };

  return (
    <SectionShell
      title="Solicitudes"
      subtitle="Cola para revision de solicitantes, puntaje y flujo de decision de vivienda."
    >
      <section className="panel overflow-x-auto p-2">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-[0.09em] text-ink-soft">
              <th className="px-3 py-3">Solicitante</th>
              <th className="px-3 py-3">Estado</th>
              <th className="px-3 py-3">Puntaje</th>
              <th className="px-3 py-3">Enviado</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.applicant} className="border-b border-line/70">
                <td className="px-3 py-3 font-medium text-ink">
                  {row.applicant}
                </td>
                <td className="px-3 py-3">
                  <StatusPill tone={getTone(row.status)}>{row.status}</StatusPill>
                </td>
                <td className="px-3 py-3 text-ink">{row.score}</td>
                <td className="px-3 py-3 text-ink-soft">{row.submittedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </SectionShell>
  );
}
