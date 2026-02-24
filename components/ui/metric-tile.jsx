import StatusPill from "@/components/ui/status-pill";

export default function MetricTile({ label, value, trend, tone = "blue" }) {
  return (
    <article className="panel reveal-stagger relative overflow-hidden border border-line/70 p-4 md:p-5">
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue/80 to-transparent"
      />
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] uppercase tracking-[0.14em] text-ink-soft/95">
          {label}
        </p>
        <StatusPill tone={tone}>{trend}</StatusPill>
      </div>
      <p className="mt-7 text-5xl font-semibold tracking-tight text-ink md:text-[3.3rem]">{value}</p>
    </article>
  );
}
