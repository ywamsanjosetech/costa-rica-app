import Link from "next/link";
import StatusPill from "@/components/ui/status-pill";

export default function PublicHomePage() {
  return (
    <main className="relative isolate space-y-6 animate-rise">
      <section className="relative overflow-hidden">
        <div className="border-b border-line bg-gradient-to-r from-blue/80 via-teal/72 to-ink/70 px-4 py-2 text-center text-xs font-semibold tracking-[0.12em] text-bg-base">
          EMERGENCY HOUSING RESPONSE PLATFORM
        </div>

        <div className="relative min-h-[620px]">
          <header className="relative z-20 flex items-center justify-between gap-3 px-4 py-4 md:px-7">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-teal/45 bg-bg-elev/90 text-sm font-semibold text-teal">
                YW
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">YWAM San Jose</p>
                <p className="text-xs text-ink-soft">Costa Rica</p>
              </div>
            </div>
            <div className="panel flex items-center gap-2 p-1.5">
              <Link href="/admin/dashboard" className="btn-secondary px-4 py-2 text-sm">
                Admin
              </Link>
              <Link href="/apply/housing-relief-2026" className="btn-primary px-4 py-2 text-sm">
                Start Intake
              </Link>
            </div>
          </header>

          <div className="relative z-20 grid min-h-[540px] gap-8 px-4 pb-8 md:grid-cols-[1.1fr_360px] md:px-7 md:pb-10">
            <div className="self-center">
              <StatusPill tone="success">Vulnerable Families Assessment</StatusPill>
              <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">
                <span className="text-gradient">Interface</span>
                <br />
                for Real-World Humanitarian Response
              </h1>
              <p className="mt-4 max-w-2xl text-base text-ink-soft">
                High-trust intake for families in need, paired with internal
                scoring and operations analytics for fast coordinated decisions.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link href="/apply/housing-relief-2026" className="btn-primary px-5 py-3 text-sm">
                  Submit Housing Request
                </Link>
                <Link href="/admin/submissions" className="btn-secondary px-5 py-3 text-sm">
                  Review Submissions
                </Link>
              </div>
            </div>

            <aside className="panel-strong animate-pulse-glow self-end p-5 md:self-center">
              <p className="text-xs uppercase tracking-[0.12em] text-ink-soft">
                Command Overview
              </p>
              <div className="mt-4 space-y-3">
                <div className="rounded-xl border border-line bg-bg-elev/66 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-ink-soft">
                    Intake Quality
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-ink">94.7%</p>
                </div>
                <div className="rounded-xl border border-line bg-bg-elev/66 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-ink-soft">
                    Pending Cases
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-ink">32</p>
                </div>
                <div className="rounded-xl border border-line bg-bg-elev/66 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-ink-soft">
                    Average Turnaround
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-ink">2h 14m</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="grid gap-4 reveal-stagger md:grid-cols-3">
        <article className="panel p-5">
          <p className="text-[11px] uppercase tracking-[0.14em] text-ink-soft">
            Dynamic Public Forms
          </p>
          <p className="mt-2 text-3xl font-semibold text-ink">Live</p>
          <p className="mt-2 text-sm text-ink-soft">
            Shareable URLs with secure form submission and anti-spam protection.
          </p>
        </article>
        <article className="panel p-5">
          <p className="text-[11px] uppercase tracking-[0.14em] text-ink-soft">
            Internal Scoring
          </p>
          <p className="mt-2 text-3xl font-semibold text-ink">Weighted</p>
          <p className="mt-2 text-sm text-ink-soft">
            Reviewers prioritize candidates using transparent urgency logic.
          </p>
        </article>
        <article className="panel p-5">
          <p className="text-[11px] uppercase tracking-[0.14em] text-ink-soft">
            Decision Analytics
          </p>
          <p className="mt-2 text-3xl font-semibold text-ink">Actionable</p>
          <p className="mt-2 text-sm text-ink-soft">
            Dashboards and exports for nonprofit operations and reporting.
          </p>
        </article>
      </section>
    </main>
  );
}
