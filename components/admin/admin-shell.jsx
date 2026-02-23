import Link from "next/link";
import AdminNav from "@/components/admin/admin-nav";
import StatusPill from "@/components/ui/status-pill";

export default function AdminShell({ children }) {
  return (
    <div className="min-h-screen">
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 md:grid-cols-[300px_1fr] md:px-6">
        <aside className="panel-strong animate-pulse-glow h-fit space-y-6 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue">
              YWAM San Jose CR
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-ink">
              Housing Admin
            </h1>
            <p className="mt-2 text-sm text-ink-soft">
              Coordinated review and prioritization for humanitarian housing
              response.
            </p>
          </div>
          <AdminNav />
          <div className="rounded-xl border border-line bg-bg-base/70 p-3 text-xs text-ink-soft">
            Auth layer pending. Route is scaffolded as protected infrastructure.
          </div>
        </aside>

        <div className="space-y-4">
          <header className="panel flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-ink-soft">
                Internal Operations
              </p>
              <p className="text-xl font-semibold text-ink">
                YWAM Housing Assessment
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <StatusPill tone="success">System online</StatusPill>
              <Link href="/apply/housing-relief-2026" className="btn-secondary px-4 py-2 text-sm">
                View Public Form
              </Link>
            </div>
          </header>
          <div className="animate-rise">{children}</div>
        </div>
      </div>
    </div>
  );
}
