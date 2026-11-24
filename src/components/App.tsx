"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { demoCheckins } from "@/lib/demo";
import { groupByVenue, localDate } from "@/lib/stats";
import type { Checkin, SessionInfo } from "@/lib/types";
import CheckinDialog from "./CheckinDialog";
import PlaceSearch from "./PlaceSearch";
import StatsView from "./StatsView";
import { formatWhen } from "./format";

const MapView = dynamic(() => import("./MapView"), { ssr: false });

type Tab = "historie" | "karte" | "auswertung" | "suche";
type SortKey = "createdAt" | "venueName" | "city" | "category";

const TABS: Array<[Tab, string]> = [
  ["historie", "Historie"],
  ["karte", "Karte"],
  ["auswertung", "Auswertung"],
  ["suche", "Ortssuche"],
];
const CACHE_KEY = "anlz4sqr.checkins.v1";
const PAGE_SIZE = 100;

const ERRORS: Record<string, string> = {
  nicht_konfiguriert: "Die App ist noch nicht konfiguriert (FSQ_CLIENT_ID / FSQ_CLIENT_SECRET fehlen).",
  login_abgebrochen: "Die Anmeldung wurde abgebrochen.",
  state_ungueltig: "Die Anmeldung konnte nicht bestätigt werden. Bitte erneut versuchen.",
  token_tausch: "Foursquare hat kein Zugriffstoken geliefert. Stimmen Client-Secret und Redirect-URL?",
};

function readCache(): { savedAt: number; items: Checkin[] } | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function writeCache(items: Checkin[] | null) {
  try {
    if (items) localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), items }));
    else localStorage.removeItem(CACHE_KEY);
  } catch {
    /* Speicher voll oder gesperrt – dann eben ohne Zwischenspeicher */
  }
}

export default function App() {
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [checkins, setCheckins] = useState<Checkin[] | null>(null);
  const [demo, setDemo] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const [tab, setTab] = useState<Tab>("historie");
  const [text, setText] = useState("");
  const [year, setYear] = useState("");
  const [onlyComments, setOnlyComments] = useState(false);
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "createdAt", dir: -1 });
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Checkin | null>(null);

  const loadAll = useCallback(async () => {
    setError(null);
    setProgress("Lade Check-ins …");
    const all: Checkin[] = [];
    try {
      let offset = 0;
      for (let i = 0; i < 400; i++) {
        const res = await fetch(`/api/checkins?offset=${offset}`);
        const body = await res.json();
        if (res.status === 401) {
          setSession((s) => (s ? { ...s, loggedIn: false } : s));
          throw new Error("Die Anmeldung ist abgelaufen. Bitte neu verbinden.");
        }
        if (!res.ok) throw new Error(body?.error ?? `Fehler ${res.status}`);
        all.push(...(body.items as Checkin[]));
        offset += body.received as number;
        setProgress(`Lade Check-ins … ${offset}${body.total ? ` von ${body.total}` : ""}`);
        if (!body.received || (body.total && offset >= body.total)) break;
      }
      setCheckins(all);
      setSavedAt(Date.now());
      writeCache(all);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Abruf fehlgeschlagen.");
      if (all.length > 0) setCheckins(all);
    } finally {
      setProgress(null);
    }
  }, []);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("error");
    if (code) {
      setError(ERRORS[code] ?? "Anmeldung fehlgeschlagen.");
      window.history.replaceState(null, "", window.location.pathname);
    }
    fetch("/api/session")
      .then((r) => r.json())
      .then((s: SessionInfo) => {
        setSession(s);
        if (!s.loggedIn) return;
        const cached = readCache();
        if (cached?.items?.length) {
          setCheckins(cached.items);
          setSavedAt(cached.savedAt);
        } else void loadAll();
      })
      .catch(() => setError("Der Server ist nicht erreichbar."));
  }, [loadAll]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    writeCache(null);
    setCheckins(null);
    setDemo(false);
    setSession((s) => (s ? { ...s, loggedIn: false } : s));
  }

  const years = useMemo(() => {
    const set = new Set<string>();
    for (const c of checkins ?? []) if (c.createdAt) set.add(String(localDate(c).getUTCFullYear()));
    return [...set].sort().reverse();
  }, [checkins]);

  const filtered = useMemo(() => {
    const needle = text.trim().toLocaleLowerCase("de");
    return (checkins ?? []).filter((c) => {
      if (onlyComments && c.commentCount === 0) return false;
      if (year && String(localDate(c).getUTCFullYear()) !== year) return false;
      if (!needle) return true;
      return [c.venueName, c.city, c.country, c.category, c.address, c.shout].some((v) =>
        v?.toLocaleLowerCase("de").includes(needle),
      );
    });
  }, [checkins, text, year, onlyComments]);

  const sorted = useMemo(() => {
    const { key, dir } = sort;
    return [...filtered].sort((a, b) => {
      const x = a[key] ?? "";
      const y = b[key] ?? "";
      const cmp = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y), "de");
      return cmp * dir || b.createdAt - a.createdAt;
    });
  }, [filtered, sort]);

  const points = useMemo(() => groupByVenue(filtered), [filtered]);
  useEffect(() => setPage(0), [text, year, onlyComments, sort]);

  const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const visible = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const header = (key: SortKey, label: string) => (
    <th aria-sort={sort.key === key ? (sort.dir === 1 ? "ascending" : "descending") : "none"}>
      <button
        className="sortbtn"
        onClick={() => setSort((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : key === "createdAt" ? -1 : 1 }))}
      >
        {label} {sort.key === key ? (sort.dir === 1 ? "▲" : "▼") : ""}
      </button>
    </th>
  );

  const hasData = checkins !== null;

  return (
    <main>
      <header className="top">
        <h1>anlz4sqr <span>Swarm-Check-ins auswerten</span></h1>
        {(session?.loggedIn || demo) && (
          <div className="actions">
            {session?.loggedIn && (
              <button className="secondary" onClick={loadAll} disabled={progress !== null}>Aktualisieren</button>
            )}
            <button className="secondary" onClick={demo ? () => { setDemo(false); setCheckins(null); } : logout}>
              {demo ? "Demo beenden" : "Abmelden"}
            </button>
          </div>
        )}
      </header>

      {error && <p className="error" role="alert">{error}</p>}
      {progress && <p className="notice" role="status">{progress}</p>}
      {demo && <p className="notice">Demo-Modus: Die angezeigten Check-ins sind erfunden.</p>}

      {session && !session.loggedIn && !demo && (
        <section className="card welcome">
          <h2>Mit Foursquare verbinden</h2>
          <p>
            Die App liest deine Swarm-Check-ins über dein Foursquare-Konto und zeigt sie als Tabelle, Karte und
            Auswertung. Dein Zugriffstoken liegt in einem httpOnly-Cookie und ist für Skripte im Browser nicht lesbar;
            die Check-ins werden nur in deinem Browser zwischengespeichert.
          </p>
          {!session.configured && (
            <p className="notice">
              Es sind noch keine Zugangsdaten hinterlegt (<code>FSQ_CLIENT_ID</code>, <code>FSQ_CLIENT_SECRET</code>).
              Die Einrichtung steht im README.
            </p>
          )}
          <div className="actions">
            {session.configured && <a className="button" href="/api/auth/login">Verbinden</a>}
            <button className="secondary" onClick={() => { setDemo(true); setCheckins(demoCheckins()); }}>
              Demo-Daten ansehen
            </button>
          </div>
        </section>
      )}

      {(hasData || session?.loggedIn) && (
        <>
          <nav className="tabs" role="tablist">
            {TABS.map(([id, label]) => (
              <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}>{label}</button>
            ))}
          </nav>

          {tab !== "suche" && (
            <div className="filters">
              <input
                type="search"
                placeholder="Ort, Stadt, Kategorie, Text …"
                aria-label="Check-ins filtern"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <select aria-label="Jahr" value={year} onChange={(e) => setYear(e.target.value)}>
                <option value="">Alle Jahre</option>
                {years.map((y) => <option key={y}>{y}</option>)}
              </select>
              <label className="check">
                <input type="checkbox" checked={onlyComments} onChange={(e) => setOnlyComments(e.target.checked)} />
                nur mit Kommentaren
              </label>
              <span className="muted small">
                {filtered.length.toLocaleString("de-DE")} von {(checkins?.length ?? 0).toLocaleString("de-DE")} Check-ins
                {savedAt && !demo ? ` · Stand ${new Date(savedAt).toLocaleDateString("de-DE")}` : ""}
              </span>
            </div>
          )}

          {tab === "historie" && (
            <>
              <div className="tablewrap">
                <table>
                  <thead>
                    <tr>
                      {header("createdAt", "Datum")}
                      {header("venueName", "Ort")}
                      {header("category", "Kategorie")}
                      {header("city", "Stadt")}
                      <th>Notiz</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.length === 0 && (
                      <tr><td colSpan={5} className="muted">{hasData ? "Keine Check-ins gefunden." : "Noch keine Daten."}</td></tr>
                    )}
                    {visible.map((c) => (
                      <tr key={c.id}>
                        <td className="nowrap">{formatWhen(c)}</td>
                        <td><button className="link" onClick={() => setSelected(c)}>{c.venueName}</button></td>
                        <td>{c.category ?? ""}</td>
                        <td>{c.city ?? ""}</td>
                        <td>
                          {c.shout ?? ""}
                          {c.commentCount > 0 && <span className="badge" title="Kommentare">💬 {c.commentCount}</span>}
                          {c.photoCount > 0 && <span className="badge" title="Fotos">📷 {c.photoCount}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {pages > 1 && (
                <div className="pager">
                  <button className="secondary" disabled={page === 0} onClick={() => setPage(page - 1)}>Zurück</button>
                  <span>Seite {page + 1} von {pages}</span>
                  <button className="secondary" disabled={page >= pages - 1} onClick={() => setPage(page + 1)}>Weiter</button>
                </div>
              )}
            </>
          )}

          {tab === "karte" && (
            <>
              <MapView points={points} />
              <p className="muted small">{points.length.toLocaleString("de-DE")} Orte · Kreisgröße = Anzahl der Check-ins</p>
            </>
          )}
          {tab === "auswertung" && <StatsView checkins={filtered} />}
          {tab === "suche" && <PlaceSearch enabled={Boolean(session?.placesConfigured)} />}
        </>
      )}

      {selected && <CheckinDialog checkin={selected} demo={demo} onClose={() => setSelected(null)} />}
      <footer className="muted small">Ortsdaten: Foursquare · Karte: OpenStreetMap</footer>
    </main>
  );
}
