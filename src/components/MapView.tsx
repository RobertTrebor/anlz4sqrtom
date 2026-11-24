"use client";

import { useEffect, useRef } from "react";
import type * as Leaflet from "leaflet";
import "leaflet/dist/leaflet.css";

export interface MapPoint {
  key: string;
  name: string;
  lat: number;
  lng: number;
  count?: number;
  detail?: string;
}

interface Props {
  points: MapPoint[];
  /** Gewählte Koordinate (Ortssuche) */
  picked?: [number, number];
  onPick?: (lat: number, lng: number) => void;
  /** Ausschnitt an die Punkte anpassen, wenn sie sich ändern */
  fit?: boolean;
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch] ?? ch);

export default function MapView({ points, picked, onPick, fit = true }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const state = useRef<{
    L: typeof Leaflet;
    map: Leaflet.Map;
    layer: Leaflet.LayerGroup;
    pin?: Leaflet.CircleMarker;
  } | null>(null);
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;
  const latest = useRef({ points, picked, fit });
  latest.current = { points, picked, fit };

  const draw = () => {
    const s = state.current;
    if (!s) return;
    const { L, map, layer } = s;
    const { points, picked, fit } = latest.current;
    layer.clearLayers();
    const max = Math.max(1, ...points.map((p) => p.count ?? 1));
    for (const p of points) {
      const count = p.count ?? 1;
      const marker = L.circleMarker([p.lat, p.lng], {
        radius: 5 + 11 * Math.sqrt(count / max),
        color: "#c2410c",
        weight: 1,
        fillColor: "#f97316",
        fillOpacity: 0.55,
      });
      const lines = [`<strong>${escapeHtml(p.name)}</strong>`];
      if (p.detail) lines.push(escapeHtml(p.detail));
      if (p.count !== undefined) lines.push(`${p.count} Check-in${p.count === 1 ? "" : "s"}`);
      marker.bindPopup(lines.join("<br>"));
      marker.addTo(layer);
    }
    s.pin?.remove();
    s.pin = undefined;
    if (picked) {
      s.pin = L.circleMarker(picked, { radius: 8, color: "#1d4ed8", weight: 3, fillOpacity: 0.2 }).addTo(map);
    }
    if (fit && points.length > 0) {
      map.fitBounds(L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number])), {
        padding: [30, 30],
        maxZoom: 15,
      });
    } else if (picked && points.length === 0) {
      map.setView(picked, Math.max(map.getZoom(), 13));
    }
  };

  useEffect(() => {
    let cancelled = false;
    let map: Leaflet.Map | undefined;
    import("leaflet").then((mod) => {
      if (cancelled || !el.current) return;
      const L = (mod as unknown as { default?: typeof Leaflet }).default ?? mod;
      map = L.map(el.current, { preferCanvas: true }).setView(latest.current.picked ?? [51.2, 10.4], 5);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende',
      }).addTo(map);
      map.on("click", (e) => onPickRef.current?.(e.latlng.lat, e.latlng.lng));
      state.current = { L, map, layer: L.layerGroup().addTo(map) };
      draw();
    });
    return () => {
      cancelled = true;
      map?.remove();
      state.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(draw, [points, picked?.[0], picked?.[1], fit]);

  return <div ref={el} className="map" role="application" aria-label="Karte" />;
}
