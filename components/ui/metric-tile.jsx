import StatusPill from "@/components/ui/status-pill";

export default function MetricTile({ label, value, trend, tone = "blue" }) {
  return (
    <article className="panel reveal-stagger overflow-hidden p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] uppercase tracking-[0.14em] text-ink-soft">
          {label}
        </p>
        <StatusPill tone={tone}>{trend}</StatusPill>
      </div>
      <p className="mt-5 text-3xl font-semibold text-ink">{value}</p>
    </article>
  );
}
