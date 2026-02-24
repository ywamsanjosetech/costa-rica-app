import SectionShell from "@/components/admin/section-shell";
import MetricTile from "@/components/ui/metric-tile";
import MiniBars from "@/components/ui/mini-bars";
import StatusPill from "@/components/ui/status-pill";

const metrics = [
  { label: "Nuevas solicitudes (24h)", value: "14", trend: "+18%", tone: "blue" },
  { label: "Pendientes de revision", value: "32", trend: "en cola", tone: "pink" },
  {
    label: "Aprobadas para vivienda",
    value: "9",
    trend: "verificado",
    tone: "success",
  },
  {
    label: "Puntaje promedio de urgencia",
    value: "74/100",
    trend: "estable",
    tone: "neutral",
  },
];

export default function AdminDashboardPage() {
  return (
    <SectionShell
      title="Panel"
      subtitle="Estado general de ingresos, revision y priorizacion."
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricTile key={metric.label} {...metric} />
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <article className="panel relative overflow-hidden border border-line/70 p-5 md:p-6">
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue/75 to-transparent"
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xl font-semibold text-ink">Velocidad de ingresos</p>
            <StatusPill tone="blue">senal en vivo</StatusPill>
          </div>
          <MiniBars bars={[28, 45, 39, 56, 61, 71, 68, 74, 82, 78]} />
        </article>

        <article className="panel relative overflow-hidden border border-line/70 p-5 md:p-6">
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal/75 to-transparent"
          />
          <p className="text-xl font-semibold text-ink">Notas operativas</p>
          <ul className="mt-5 space-y-4 text-lg leading-relaxed text-ink-soft">
            <li>Las solicitudes del distrito norte aumentaron tras las alertas climaticas.</li>
            <li>El retraso en el traspaso de revision disminuyo con la nueva plantilla de puntaje.</li>
            <li>La calidad de completado del formulario mejoro con instrucciones mas claras.</li>
          </ul>
        </article>
      </section>
    </SectionShell>
  );
}
