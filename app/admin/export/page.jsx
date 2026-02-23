import SectionShell from "@/components/admin/section-shell";
import StatusPill from "@/components/ui/status-pill";

export default function AdminExportPage() {
  return (
    <SectionShell
      title="Export"
      subtitle="Generate scoped data exports for reporting and coordination."
    >
      <section className="panel space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-soft">
            Create controlled output packages for donors, leadership, and
            partner teams.
          </p>
          <StatusPill tone="neutral">Audit trail enabled</StatusPill>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-ink">Status</span>
            <select className="input-lux w-full px-3 py-2 text-sm">
              <option>All statuses</option>
              <option>Pending</option>
              <option>Under Review</option>
              <option>Approved</option>
              <option>Denied</option>
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-ink">Format</span>
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
          Generate Export
        </button>
      </section>
    </SectionShell>
  );
}
