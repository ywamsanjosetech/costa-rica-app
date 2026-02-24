export default function SectionShell({ title, subtitle, children, headerClassName = "" }) {
  return (
    <main className="space-y-5">
      <section
        className={`panel-strong relative overflow-hidden border border-line/70 p-6 md:p-7 ${headerClassName}`}
      >
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal/80 to-transparent"
        />
        <p className="text-xs uppercase tracking-[0.14em] text-ink-soft">
          Modulo administrativo
        </p>
        <h2 className="mt-2 text-4xl font-semibold tracking-tight text-ink">{title}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-soft">{subtitle}</p>
      </section>
      {children}
    </main>
  );
}
