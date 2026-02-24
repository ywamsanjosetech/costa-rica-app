"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Map as UiMap,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  useMap,
} from "@/components/ui/map";

const STATUS_DOT_COLORS = {
  submitted: "bg-blue-300",
  under_review: "bg-amber-300",
  approved: "bg-emerald-300",
  denied: "bg-rose-300",
  waitlisted: "bg-violet-300",
};

function toYearKey(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return String(date.getUTCFullYear());
}

function getHeatWeight(point, mode) {
  if (mode === "puntaje") {
    const score = Number(point.score);
    if (!Number.isFinite(score)) return 0.2;
    return Math.max(0.2, Math.min(2.2, score / 45));
  }

  if (mode === "hogar") {
    const members = Number(point.householdSize);
    if (!Number.isFinite(members)) return 0.2;
    return Math.max(0.2, Math.min(2.2, members / 2.6));
  }

  return 1;
}

function ImpactHeatLayer({ points, mode, visible }) {
  const { map, isLoaded } = useMap();
  const sourceId = "impacto-solicitudes-source";
  const layerId = "impacto-solicitudes-layer";

  const geojson = useMemo(
    () => ({
      type: "FeatureCollection",
      features: points.map((point) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [point.lng, point.lat],
        },
        properties: {
          id: point.id,
          weight: getHeatWeight(point, mode),
        },
      })),
    }),
    [points, mode],
  );

  useEffect(() => {
    if (!map || !isLoaded) return;

    try {
      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, {
          type: "geojson",
          data: geojson,
        });
      }

      const source = map.getSource(sourceId);
      if (source && "setData" in source) {
        source.setData(geojson);
      }

      if (!map.getLayer(layerId)) {
        map.addLayer({
          id: layerId,
          type: "heatmap",
          source: sourceId,
          maxzoom: 15,
          paint: {
            "heatmap-weight": ["coalesce", ["get", "weight"], 1],
            "heatmap-intensity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              5,
              0.35,
              9,
              0.95,
              12,
              1.45,
            ],
            "heatmap-color": [
              "interpolate",
              ["linear"],
              ["heatmap-density"],
              0,
              "rgba(16,39,67,0)",
              0.2,
              "rgba(112,198,255,0.35)",
              0.45,
              "rgba(128,255,228,0.52)",
              0.7,
              "rgba(255,224,133,0.7)",
              1,
              "rgba(255,120,120,0.9)",
            ],
            "heatmap-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              5,
              14,
              8,
              22,
              11,
              36,
            ],
            "heatmap-opacity": 0.78,
          },
        });
      }

      map.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
    } catch {
      // El mapa puede estar en proceso de desmontaje; evitamos romper la UI.
    }
  }, [map, isLoaded, geojson, visible]);

  useEffect(
    () => () => {
      if (!map) return;
      try {
        if (map.getLayer(layerId)) map.removeLayer(layerId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      } catch {
        // Ignora errores de limpieza cuando la instancia ya fue destruida.
      }
    },
    [map],
  );

  return null;
}

export default function AnalyticsImpactMap({
  points,
  geocoderLabel,
  loadError = null,
}) {
  const [showImpact, setShowImpact] = useState(false);
  const [impactMode, setImpactMode] = useState("densidad");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formFilter, setFormFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(null);

  const yearOptions = useMemo(() => {
    const set = new Set();
    for (const point of points) {
      const key = toYearKey(point.submittedAt);
      if (key) set.add(key);
    }
    return [...set].sort((a, b) => Number(b) - Number(a));
  }, [points]);

  const formOptions = useMemo(() => {
    const bySlug = new Map();
    for (const point of points) {
      if (!bySlug.has(point.formSlug)) {
        bySlug.set(point.formSlug, {
          slug: point.formSlug,
          title: point.formTitle,
        });
      }
    }
    return [...bySlug.values()].sort((a, b) => a.title.localeCompare(b.title, "es"));
  }, [points]);

  const filteredPoints = useMemo(
    () =>
      points.filter((point) => {
        if (statusFilter !== "all" && point.status !== statusFilter) return false;
        if (formFilter !== "all" && point.formSlug !== formFilter) return false;
        if (yearFilter !== "all" && toYearKey(point.submittedAt) !== yearFilter) {
          return false;
        }
        return true;
      }),
    [points, statusFilter, formFilter, yearFilter],
  );

  const selectedPoint = useMemo(
    () => filteredPoints.find((point) => point.id === selectedId) || null,
    [filteredPoints, selectedId],
  );

  return (
    <article className="panel p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-ink">Mapa nacional de solicitudes</p>
        <p className="text-xs uppercase tracking-[0.09em] text-ink-soft">
          Geocodificación: {geocoderLabel}
        </p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <label className="space-y-1">
          <span className="text-sm font-bold uppercase tracking-[0.1em] text-ink">
            Estado
          </span>
          <select
            className="input-lux h-11 w-full px-3 text-sm"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">Todos</option>
            <option value="submitted">Pendiente</option>
            <option value="under_review">En revisión</option>
            <option value="approved">Aprobado</option>
            <option value="denied">Denegado</option>
            <option value="waitlisted">Lista de espera</option>
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-sm font-bold uppercase tracking-[0.1em] text-ink">
            Formulario
          </span>
          <select
            className="input-lux h-11 w-full px-3 text-sm"
            value={formFilter}
            onChange={(event) => setFormFilter(event.target.value)}
          >
            <option value="all">Todos</option>
            {formOptions.map((form) => (
              <option key={form.slug} value={form.slug}>
                {form.title}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-sm font-bold uppercase tracking-[0.1em] text-ink">
            Año
          </span>
          <select
            className="input-lux h-11 w-full px-3 text-sm"
            value={yearFilter}
            onChange={(event) => setYearFilter(event.target.value)}
          >
            <option value="all">Todos los años</option>
            {yearOptions.map((yearOption) => (
              <option key={yearOption} value={yearOption}>
                {yearOption}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-end">
          <button
            type="button"
            onClick={() => setShowImpact((value) => !value)}
            className="btn-secondary h-11 w-full px-4"
          >
            {showImpact ? "Ocultar impacto" : "Mostrar impacto"}
          </button>
        </div>

        <label className="space-y-1">
          <span className="text-sm font-bold uppercase tracking-[0.1em] text-ink">
            Impacto
          </span>
          <select
            className="input-lux h-11 w-full px-3 text-sm disabled:cursor-not-allowed disabled:opacity-55"
            value={impactMode}
            onChange={(event) => setImpactMode(event.target.value)}
            disabled={!showImpact}
          >
            <option value="densidad">Densidad de solicitudes</option>
            <option value="puntaje">Prioridad por puntaje</option>
            <option value="hogar">Tamaño del hogar</option>
          </select>
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ink-soft">
        <span className="rounded-full border border-line/70 bg-bg-elev/45 px-3 py-1">
          Total filtrado: {filteredPoints.length}
        </span>
        {showImpact ? (
          <span className="rounded-full border border-teal/50 bg-teal/16 px-3 py-1 text-teal">
            Impacto activo: {impactMode}
          </span>
        ) : null}
      </div>

      <div className="mt-4 h-[520px] overflow-hidden rounded-2xl border border-line/70 bg-bg-base/30">
        <UiMap
          className="h-full w-full"
          theme="dark"
          center={[-84.1942, 9.7489]}
          zoom={7}
          minZoom={0}
          maxZoom={15}
          attributionControl={false}
        >
          <MapControls position="top-right" showLocate={false} />
          <ImpactHeatLayer points={filteredPoints} mode={impactMode} visible={showImpact} />

          {filteredPoints.map((point) => (
            <MapMarker
              key={point.id}
              longitude={point.lng}
              latitude={point.lat}
              onClick={() => setSelectedId(point.id)}
            >
              <MarkerContent>
                <button
                  type="button"
                  aria-label={`Solicitud ${point.applicantName}`}
                  className={`${showImpact ? "h-1.5 w-1.5 border border-white/80 shadow-none opacity-80" : "h-4 w-4 border-2 border-white/90 shadow-[0_0_0_6px_rgba(5,10,20,0.16)] transition-transform hover:scale-110"} rounded-full ${
                    STATUS_DOT_COLORS[point.status] || "bg-blue-300"
                  }`}
                />
              </MarkerContent>

              {selectedId === point.id ? (
                <MarkerPopup closeButton>
                  <div className="min-w-[220px] space-y-1 text-xs">
                    <p className="font-semibold text-ink">{point.applicantName}</p>
                    <p className="text-ink-soft">Estado: {point.statusLabel}</p>
                    <p className="text-ink-soft">Formulario: {point.formTitle}</p>
                    <p className="text-ink-soft">Provincia: {point.province}</p>
                    <p className="text-ink-soft">
                      Puntaje: {Number.isFinite(point.score) ? point.score : "Sin puntaje"}
                    </p>
                    <p className="text-ink-soft">
                      Hogar:{" "}
                      {Number.isFinite(point.householdSize)
                        ? point.householdSize
                        : "No disponible"}
                    </p>
                  </div>
                </MarkerPopup>
              ) : null}
            </MapMarker>
          ))}
        </UiMap>
      </div>

      {loadError ? (
        <p className="mt-3 rounded-xl border border-rose-400/40 bg-rose-400/10 px-3 py-2 text-xs text-rose-200">
          {loadError}
        </p>
      ) : null}

      {selectedPoint ? (
        <p className="mt-3 text-xs text-ink-soft">
          Selección actual: {selectedPoint.applicantName} |{" "}
          {selectedPoint.address || "Sin dirección registrada"}
        </p>
      ) : null}
    </article>
  );
}
