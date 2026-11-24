"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import categories from "@/data/categories.json";
import type { CategoryNode, Place } from "@/lib/types";
import type { MapPoint } from "./MapView";

const MapView = dynamic(() => import("./MapView"), { ssr: false });

// Startpunkt der alten App (Berlin)
const START: [number, number] = [52.531227, 13.403921];

export default function PlaceSearch({ enabled }: { enabled: boolean }) {
  const [pos, setPos] = useState<[number, number]>(START);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [radius, setRadius] = useState(2000);
  const [results, setResults] = useState<Place[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const points: MapPoint[] = useMemo(
    () =>
      (results ?? [])
        .filter((p) => p.lat !== undefined && p.lng !== undefined)
        .map((p) => ({
          key: p.id,
          name: p.name,
          lat: p.lat as number,
          lng: p.lng as number,
          detail: [p.category, p.address, p.city].filter(Boolean).join(" · ") || undefined,
        })),
    [results],
  );

  async function search(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const params = new URLSearchParams({ ll: `${pos[0]},${pos[1]}`, query, category, radius: String(radius) });
      const res = await fetch(`/api/places?${params}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? `Fehler ${res.status}`);
      setResults(body.results as Place[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Suche fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  function locate() {
    if (!navigator.geolocation) return setError("Standortbestimmung wird vom Browser nicht unterstützt.");
    navigator.geolocation.getCurrentPosition(
      (p) => setPos([p.coords.latitude, p.coords.longitude]),
      () => setError("Standort konnte nicht bestimmt werden."),
    );
  }

  const setCoord = (i: 0 | 1, value: string) => {
    const n = Number(value.replace(",", "."));
    if (Number.isFinite(n)) setPos(i === 0 ? [n, pos[1]] : [pos[0], n]);
  };

  return (
    <div>
      {!enabled && (
        <p className="notice">
          Für die Ortssuche fehlt der Service Key (<code>FSQ_SERVICE_KEY</code>). Siehe README.
        </p>
      )}
      <form className="searchform" onSubmit={search}>
        <label>
          Breite
          <input inputMode="decimal" key={pos[0]} defaultValue={pos[0].toFixed(6)} onBlur={(e) => setCoord(0, e.target.value)} />
        </label>
        <label>
          Länge
          <input inputMode="decimal" key={pos[1]} defaultValue={pos[1].toFixed(6)} onBlur={(e) => setCoord(1, e.target.value)} />
        </label>
        <label className="grow">
          Suchbegriff
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="z. B. Kaffee" />
        </label>
        <label className="grow">
          Kategorie
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Alle Kategorien</option>
            {(categories as CategoryNode[]).map((main) => (
              <optgroup key={main.id} label={main.name}>
                <option value={main.id}>{main.name} (alle)</option>
                {main.children?.flatMap((sub) => [
                  <option key={sub.id} value={sub.id}>{sub.name}</option>,
                  ...(sub.children ?? []).map((ss) => (
                    <option key={ss.id} value={ss.id}>— {ss.name}</option>
                  )),
                ])}
              </optgroup>
            ))}
          </select>
        </label>
        <label>
          Umkreis
          <select value={radius} onChange={(e) => setRadius(Number(e.target.value))}>
            <option value={500}>500 m</option>
            <option value={2000}>2 km</option>
            <option value={5000}>5 km</option>
            <option value={20000}>20 km</option>
          </select>
        </label>
        <div className="actions">
          <button type="button" className="secondary" onClick={locate}>Mein Standort</button>
          <button type="submit" disabled={busy || !enabled}>{busy ? "Suche …" : "Suchen"}</button>
        </div>
      </form>
      <p className="muted small">Tipp: Ein Klick auf die Karte setzt den Suchmittelpunkt.</p>
      {error && <p className="error">{error}</p>}
      <MapView points={points} picked={pos} onPick={(lat, lng) => setPos([lat, lng])} />
      {results && (
        <div className="tablewrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Kategorie</th><th>Adresse</th><th>Ort</th><th className="num">Entfernung</th></tr>
            </thead>
            <tbody>
              {results.length === 0 && (
                <tr><td colSpan={5} className="muted">Keine Treffer.</td></tr>
              )}
              {results.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.website && /^https?:\/\//i.test(p.website) ? <a href={p.website} target="_blank" rel="noopener noreferrer">{p.name}</a> : p.name}
                  </td>
                  <td>{p.category ?? ""}</td>
                  <td>{p.address ?? ""}</td>
                  <td>{[p.postcode, p.city].filter(Boolean).join(" ")}</td>
                  <td className="num">{p.distance !== undefined ? `${p.distance.toLocaleString("de-DE")} m` : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
