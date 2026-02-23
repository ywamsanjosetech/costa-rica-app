import SectionShell from "@/components/admin/section-shell";
import StatusPill from "@/components/ui/status-pill";

const rows = [
  {
    applicant: "Maria Gutierrez",
    status: "Pending",
    score: "82",
    submittedAt: "2026-02-19",
  },
  {
    applicant: "Andres Mena",
    status: "Under Review",
    score: "67",
    submittedAt: "2026-02-18",
  },
  {
    applicant: "Rosa Nunez",
    status: "Approved",
    score: "91",
    submittedAt: "2026-02-17",
  },
];

export default function AdminSubmissionsPage() {
  const getTone = (status) => {
    if (status === "Approved") return "success";
    if (status === "Pending") return "pink";
    if (status === "Under Review") return "blue";
    return "neutral";
  };

  return (
    <SectionShell
      title="Submissions"
      subtitle="Queue for applicant review, scoring, and housing decision workflow."
    >
      <section className="panel overflow-x-auto p-2">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-[0.09em] text-ink-soft">
              <th className="px-3 py-3">Applicant</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Score</th>
              <th className="px-3 py-3">Submitted</th>
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
