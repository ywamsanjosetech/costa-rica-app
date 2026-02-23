export default function SectionShell({ title, subtitle, children }) {
  return (
    <main className="space-y-4">
      <section className="panel-strong p-6">
        <p className="text-xs uppercase tracking-[0.14em] text-ink-soft">
          Admin Module
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-ink">{title}</h2>
        <p className="mt-2 text-sm text-ink-soft">{subtitle}</p>
      </section>
      {children}
    </main>
  );
}
