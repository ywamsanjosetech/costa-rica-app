import SectionShell from "@/components/admin/section-shell";
import AnalyticsImpactMap from "@/components/admin/analytics-impact-map";
import MiniBars from "@/components/ui/mini-bars";
import StatusPill from "@/components/ui/status-pill";
import { fetchAssessmentSummaries } from "@/lib/admin/assessments";
import {
  buildAssessmentMapPoints,
  getGeocodingProviderLabel,
} from "@/lib/admin/geocoding";

function startOfUtcWeek(date) {
  const normalized = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const day = (normalized.getUTCDay() + 6) % 7;
  normalized.setUTCDate(normalized.getUTCDate() - day);
  normalized.setUTCHours(0, 0, 0, 0);
  return normalized;
}

function buildWeeklySeries(summaries, totalWeeks = 8) {
  const now = new Date();
  const currentWeekStart = startOfUtcWeek(now);
  const weekStarts = [];
  const indexByWeekKey = new Map();

  for (let index = totalWeeks - 1; index >= 0; index -= 1) {
    const weekStart = new Date(currentWeekStart);
    weekStart.setUTCDate(weekStart.getUTCDate() - index * 7);
    const key = weekStart.toISOString().slice(0, 10);
    indexByWeekKey.set(key, weekStarts.length);
    weekStarts.push(weekStart);
  }

  const counts = new Array(totalWeeks).fill(0);
  for (const summary of summaries) {
    if (!summary.submittedAt) continue;
    const submittedDate = new Date(summary.submittedAt);
    if (Number.isNaN(submittedDate.getTime())) continue;
    const weekKey = startOfUtcWeek(submittedDate).toISOString().slice(0, 10);
    const index = indexByWeekKey.get(weekKey);
    if (index !== undefined) counts[index] += 1;
  }

  const maxCount = Math.max(...counts, 1);
  const bars = counts.map((count) => {
    if (count === 0) return 10;
    return Math.max(14, Math.round((count / maxCount) * 100));
  });

  return { counts, bars };
}

function buildScoreDistribution(summaries) {
  const scoreBuckets = [
    { key: "muy_alto", label: "Muy alto (85+)", min: 85, max: Infinity },
    { key: "alto", label: "Alto (70-84)", min: 70, max: 84.999 },
    { key: "medio", label: "Medio (55-69)", min: 55, max: 69.999 },
    { key: "bajo", label: "Bajo (<55)", min: -Infinity, max: 54.999 },
  ];

  const counts = new Map(scoreBuckets.map((bucket) => [bucket.key, 0]));

  for (const summary of summaries) {
    if (!Number.isFinite(summary.score)) continue;
    const score = Number(summary.score);
    const bucket = scoreBuckets.find((item) => score >= item.min && score <= item.max);
    if (!bucket) continue;
    counts.set(bucket.key, (counts.get(bucket.key) || 0) + 1);
  }

  const highestBucketCount = Math.max(...[...counts.values(), 1]);

  return scoreBuckets.map((bucket, index) => {
    const count = counts.get(bucket.key) || 0;
    const width = count === 0 ? 12 : Math.max(18, Math.round((count / highestBucketCount) * 100));
    const toneClass =
      index === 0
        ? "from-blue/85 to-teal/60"
        : index === 1
          ? "from-blue/74 to-teal/58"
          : index === 2
            ? "from-blue/64 to-ink/52"
            : "from-teal/58 to-ink/44";

    return {
      ...bucket,
      count,
      width,
      toneClass,
    };
  });
}

export default async function AdminAnalyticsPage() {
  let summaries = [];
  let mapPoints = [];
  let mapLoadError = null;

  try {
    summaries = await fetchAssessmentSummaries();
    mapPoints = await buildAssessmentMapPoints(summaries);
  } catch (error) {
    mapLoadError =
      error instanceof Error
        ? `No se pudo cargar el mapa de impacto: ${error.message}`
        : "No se pudo cargar el mapa de impacto.";
  }

  const weeklySeries = buildWeeklySeries(summaries, 8);
  const scoreDistribution = buildScoreDistribution(summaries);

  return (
    <SectionShell
      title="Analítica"
      subtitle="Visibilidad de tendencias de evaluación y métricas de respuesta humanitaria."
    >
      <section className="grid gap-4 lg:grid-cols-2">
        <article className="panel p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-ink">Solicitudes por semana</p>
            <StatusPill tone="blue">últimas 8 sem</StatusPill>
          </div>
          <MiniBars bars={weeklySeries.bars} />
          <p className="mt-2 text-xs text-ink-soft">
            Total últimas 8 semanas:{" "}
            {weeklySeries.counts.reduce((acc, current) => acc + current, 0)}
          </p>
        </article>

        <article className="panel p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-ink">
              Distribución de puntajes de prioridad
            </p>
            <StatusPill tone="pink">foco de alto riesgo</StatusPill>
          </div>
          <div className="mt-4 rounded-xl border border-line bg-bg-elev/45 p-4">
            <div className="reveal-stagger space-y-3">
              {scoreDistribution.map((bucket) => (
                <div key={bucket.key} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-[11px] uppercase tracking-[0.08em] text-ink-soft">
                    <span>{bucket.label}</span>
                    <span>{bucket.count}</span>
                  </div>
                  <div
                    className={`h-2.5 rounded-full bg-gradient-to-r ${bucket.toneClass}`}
                    style={{ width: `${bucket.width}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>

      <section className="mt-4">
        <AnalyticsImpactMap
          points={mapPoints}
          geocoderLabel={getGeocodingProviderLabel()}
          loadError={mapLoadError}
        />
      </section>
    </SectionShell>
  );
}
