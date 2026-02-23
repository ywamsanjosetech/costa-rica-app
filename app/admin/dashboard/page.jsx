import SectionShell from "@/components/admin/section-shell";
import MetricTile from "@/components/ui/metric-tile";
import MiniBars from "@/components/ui/mini-bars";
import StatusPill from "@/components/ui/status-pill";

const metrics = [
  { label: "New submissions (24h)", value: "14", trend: "+18%", tone: "blue" },
  { label: "Pending review", value: "32", trend: "queue", tone: "pink" },
  {
    label: "Approved for housing",
    value: "9",
    trend: "verified",
    tone: "success",
  },
  {
    label: "Average urgency score",
    value: "74/100",
    trend: "stable",
    tone: "neutral",
  },
];

export default function AdminDashboardPage() {
  return (
    <SectionShell
      title="Dashboard"
      subtitle="High-level status across intake, review, and prioritization."
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricTile key={metric.label} {...metric} />
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <article className="panel p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-ink">Intake Velocity</p>
            <StatusPill tone="blue">Live signal</StatusPill>
          </div>
          <MiniBars bars={[28, 45, 39, 56, 61, 71, 68, 74, 82, 78]} />
        </article>

        <article className="panel p-5">
          <p className="text-sm font-semibold text-ink">Operational Notes</p>
          <ul className="mt-4 space-y-3 text-sm text-ink-soft">
            <li>North district submissions increased after weather alerts.</li>
            <li>Review handoff delay decreased after new scoring template.</li>
            <li>Form completion quality improved with clearer prompts.</li>
          </ul>
        </article>
      </section>
    </SectionShell>
  );
}
