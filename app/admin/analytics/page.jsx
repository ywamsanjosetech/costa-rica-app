import SectionShell from "@/components/admin/section-shell";
import MiniBars from "@/components/ui/mini-bars";
import StatusPill from "@/components/ui/status-pill";

export default function AdminAnalyticsPage() {
  return (
    <SectionShell
      title="Analytics"
      subtitle="Assessment trend visibility and humanitarian response metrics."
    >
      <section className="grid gap-4 lg:grid-cols-2">
        <article className="panel p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-ink">Submissions by week</p>
            <StatusPill tone="blue">Rolling 8w</StatusPill>
          </div>
          <MiniBars bars={[22, 34, 41, 45, 52, 57, 61, 70]} />
        </article>

        <article className="panel p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-ink">
              Priority score distribution
            </p>
            <StatusPill tone="pink">High-risk focus</StatusPill>
          </div>
          <div className="mt-4 rounded-xl border border-line bg-bg-elev/45 p-4">
            <div className="reveal-stagger space-y-3">
              <div className="h-2.5 w-[86%] rounded-full bg-gradient-to-r from-blue/85 to-teal/60" />
              <div className="h-2.5 w-[71%] rounded-full bg-gradient-to-r from-blue/74 to-teal/58" />
              <div className="h-2.5 w-[64%] rounded-full bg-gradient-to-r from-blue/64 to-ink/52" />
              <div className="h-2.5 w-[49%] rounded-full bg-gradient-to-r from-teal/58 to-ink/44" />
            </div>
          </div>
        </article>
      </section>
    </SectionShell>
  );
}
