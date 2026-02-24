import SectionShell from "@/components/admin/section-shell";
import StatusPill from "@/components/ui/status-pill";

export default function AdminExportPage() {
  return (
    <SectionShell
      title="Exportar"
      subtitle="Generar exportaciones de datos para reportes y coordinacion."
      headerClassName="panel-strong-mint"
    >
      <section className="panel space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-soft">
            Crear paquetes de salida controlados para donantes, liderazgo y
            equipos aliados.
          </p>
          <StatusPill tone="neutral">Trazabilidad habilitada</StatusPill>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-ink">Estado</span>
            <select className="input-lux w-full px-3 py-2 text-sm">
              <option>Todos los estados</option>
              <option>Pendiente</option>
              <option>En revision</option>
              <option>Aprobado</option>
              <option>Denegado</option>
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-ink">Formato</span>
            <select className="input-lux w-full px-3 py-2 text-sm">
              <option>CSV</option>
              <option>JSON</option>
            </select>
          </label>
        </div>
        <button
          type="button"
          className="btn-primary px-5 py-2.5 text-sm"
        >
          Generar exportacion
        </button>
      </section>
    </SectionShell>
  );
}
