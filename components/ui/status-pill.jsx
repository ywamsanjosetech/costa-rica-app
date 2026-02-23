export default function StatusPill({ children, tone = "blue" }) {
  const toneMap = {
    blue: "border-blue/45 bg-blue/18 text-blue",
    pink: "border-teal/45 bg-teal/16 text-teal",
    success: "border-success/40 bg-success/16 text-success",
    neutral: "border-line bg-bg-elev/75 text-ink-soft",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${toneMap[tone] || toneMap.neutral}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}
