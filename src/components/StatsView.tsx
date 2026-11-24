"use client";

import { useMemo } from "react";
import { computeStats, type Ranked } from "@/lib/stats";
import type { Checkin } from "@/lib/types";

const fmtDay = (ts?: number) =>
  ts ? new Date(ts * 1000).toLocaleDateString("de-DE", { year: "numeric", month: "short", day: "numeric" }) : "–";

function BarList({ title, rows }: { title: string; rows: Ranked[] }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <section className="card">
      <h3>{title}</h3>
      {rows.length === 0 ? (
        <p className="muted">Keine Daten.</p>
      ) : (
        <ol className="barlist">
          {rows.map((r) => (
            <li key={r.label}>
              <span className="barlabel">{r.label}</span>
              <span className="bartrack">
                <span className="bar" style={{ width: `${(r.count / max) * 100}%` }} />
              </span>
              <span className="barvalue">{r.count}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function Columns({ title, rows, every = 1 }: { title: string; rows: Ranked[]; every?: number }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <section className="card">
      <h3>{title}</h3>
      <div className="columns" role="img" aria-label={`${title}: ${rows.map((r) => `${r.label} ${r.count}`).join(", ")}`}>
        {rows.map((r, i) => (
          <div className="col" key={r.label} title={`${r.label}: ${r.count}`}>
            <span className="colbar" style={{ height: `${(r.count / max) * 100}%` }} />
            <span className="collabel">{i % every === 0 ? r.label : ""}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function StatsView({ checkins }: { checkins: Checkin[] }) {
  const s = useMemo(() => computeStats(checkins), [checkins]);
  if (s.total === 0) return <p className="muted">Keine Check-ins in der aktuellen Auswahl.</p>;
  return (
    <div className="stats">
      <div className="tiles">
        <div className="tile"><b>{s.total.toLocaleString("de-DE")}</b><span>Check-ins</span></div>
        <div className="tile"><b>{s.uniqueVenues.toLocaleString("de-DE")}</b><span>Orte</span></div>
        <div className="tile"><b>{s.uniqueCities.toLocaleString("de-DE")}</b><span>Städte</span></div>
        <div className="tile"><b>{s.uniqueCountries}</b><span>Länder</span></div>
        <div className="tile wide"><b>{fmtDay(s.first)} – {fmtDay(s.last)}</b><span>Zeitraum</span></div>
      </div>
      <Columns title="Check-ins pro Jahr" rows={s.byYear} every={s.byYear.length > 10 ? 2 : 1} />
      <div className="grid2">
        <BarList title="Meistbesuchte Orte" rows={s.topVenues} />
        <BarList title="Städte" rows={s.topCities} />
        <BarList title="Kategorien" rows={s.topCategories} />
        <div>
          <Columns title="Wochentag" rows={s.byWeekday} />
          <Columns title="Uhrzeit (Ortszeit)" rows={s.byHour} every={3} />
        </div>
      </div>
    </div>
  );
}
