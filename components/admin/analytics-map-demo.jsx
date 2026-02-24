"use client";

import { useMemo, useState } from "react";
import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerPopup,
} from "@/components/ui/map";

const statusStyles = {
  submitted: "bg-blue-400",
  under_review: "bg-amber-400",
  approved: "bg-emerald-400",
  denied: "bg-rose-400",
  waitlisted: "bg-violet-400",
};

const statusLabels = {
  submitted: "Pendiente",
  under_review: "En revision",
  approved: "Aprobado",
  denied: "Denegado",
  waitlisted: "Lista de espera",
};

const mockMapPoints = [
  { id: "SJ-001", district: "Hatillo", status: "submitted", householdSize: 6, lng: -84.113, lat: 9.912 },
  { id: "SJ-002", district: "Pavas", status: "under_review", householdSize: 5, lng: -84.132, lat: 9.945 },
  { id: "SJ-003", district: "Desamparados", status: "approved", householdSize: 4, lng: -84.059, lat: 9.9 },
  { id: "SJ-004", district: "Goicoechea", status: "submitted", householdSize: 7, lng: -84.057, lat: 9.962 },
  { id: "SJ-005", district: "Tibas", status: "waitlisted", householdSize: 3, lng: -84.081, lat: 9.956 },
  { id: "SJ-006", district: "Alajuelita", status: "denied", householdSize: 4, lng: -84.098, lat: 9.907 },
  { id: "SJ-007", district: "San Sebastian", status: "under_review", householdSize: 8, lng: -84.09, lat: 9.895 },
  { id: "SJ-008", district: "Curridabat", status: "approved", householdSize: 5, lng: -84.035, lat: 9.913 },
  { id: "SJ-009", district: "Escazu", status: "submitted", householdSize: 2, lng: -84.139, lat: 9.92 },
  { id: "SJ-010", district: "Moravia", status: "under_review", householdSize: 6, lng: -84.005, lat: 9.97 },
];

export default function AnalyticsMapDemo() {
  const [selectedId, setSelectedId] = useState(mockMapPoints[0].id);
  const selectedPoint = useMemo(
    () => mockMapPoints.find((point) => point.id === selectedId) || null,
    [selectedId],
  );

  return (
    <article className="panel p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-ink">Mapa interactivo de solicitudes (demo)</p>
        <p className="text-xs uppercase tracking-[0.08em] text-ink-soft">
          San Jose, Costa Rica
        </p>
      </div>

      <div className="mt-4 h-[420px] overflow-hidden rounded-xl border border-line/70 bg-bg-base/30">
        <Map
          className="h-full w-full"
          theme="dark"
          center={[-84.091, 9.928]}
          zoom={11.1}
          minZoom={9.8}
          maxZoom={16}
          attributionControl={false}
        >
          <MapControls position="top-right" showLocate={false} showFullscreen={false} />

          {mockMapPoints.map((point) => {
            const markerTone = statusStyles[point.status] || "bg-blue-400";
            const label = statusLabels[point.status] || "Pendiente";

            return (
              <MapMarker
                key={point.id}
                longitude={point.lng}
                latitude={point.lat}
                onClick={() => setSelectedId(point.id)}
              >
                <MarkerContent>
                  <button
                    type="button"
                    aria-label={`Solicitud ${point.id}`}
                    className={`h-4 w-4 rounded-full border-2 border-white/90 shadow-[0_0_0_6px_rgba(5,10,20,0.16)] transition-transform hover:scale-110 ${markerTone}`}
                  />
                </MarkerContent>

                {selectedId === point.id ? (
                  <MarkerPopup closeButton>
                    <div className="min-w-[190px] space-y-1 text-xs">
                      <p className="font-semibold text-ink">{point.id}</p>
                      <p className="text-ink-soft">Distrito: {point.district}</p>
                      <p className="text-ink-soft">Miembros hogar: {point.householdSize}</p>
                      <p className="text-ink-soft">Estado: {label}</p>
                    </div>
                  </MarkerPopup>
                ) : null}
              </MapMarker>
            );
          })}
        </Map>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-ink-soft">
        {Object.entries(statusLabels).map(([status, label]) => (
          <span key={status} className="inline-flex items-center gap-2 rounded-full border border-line/70 bg-bg-elev/45 px-3 py-1">
            <span className={`h-2.5 w-2.5 rounded-full ${statusStyles[status] || "bg-blue-400"}`} />
            {label}
          </span>
        ))}
      </div>

      {selectedPoint ? (
        <p className="mt-3 text-xs text-ink-soft">
          Seleccion actual: {selectedPoint.id} ({selectedPoint.district})
        </p>
      ) : null}
    </article>
  );
}
