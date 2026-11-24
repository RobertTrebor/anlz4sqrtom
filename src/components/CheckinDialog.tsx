"use client";

import { useEffect, useRef, useState } from "react";
import type { Checkin, CheckinDetail } from "@/lib/types";
import { formatWhen } from "./format";

interface Props {
  checkin: Checkin;
  demo: boolean;
  onClose: () => void;
}

export default function CheckinDialog({ checkin, demo, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [detail, setDetail] = useState<CheckinDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  useEffect(() => {
    if (demo) return;
    let cancelled = false;
    fetch(`/api/checkins/${checkin.id}`)
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error ?? `Fehler ${res.status}`);
        if (!cancelled) setDetail(body as CheckinDetail);
      })
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : "Abruf fehlgeschlagen."));
    return () => {
      cancelled = true;
    };
  }, [checkin.id, demo]);

  const c = detail ?? checkin;
  return (
    <dialog ref={ref} onClose={onClose} onClick={(e) => e.target === ref.current && ref.current?.close()}>
      <div className="dialogbody">
        <header>
          <h2>{c.venueName}</h2>
          <button className="secondary" onClick={() => ref.current?.close()} aria-label="Schließen">✕</button>
        </header>
        <p className="muted">
          {[c.category, c.address, c.city, c.country].filter(Boolean).join(" · ")}
          <br />
          {formatWhen(c)}
        </p>
        {c.shout && <blockquote>{c.shout}</blockquote>}

        {demo ? (
          <p className="muted small">Demo-Daten: Kommentare und Fotos gibt es nur mit echtem Login.</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : !detail ? (
          <p className="muted">Lade Details …</p>
        ) : (
          <>
            <h3>Kommentare</h3>
            {detail.comments.length === 0 ? (
              <p className="muted">Keine Kommentare.</p>
            ) : (
              <ul className="comments">
                {detail.comments.map((k, i) => (
                  <li key={i}>
                    <b>{k.author ?? "Unbekannt"}:</b> {k.text}
                  </li>
                ))}
              </ul>
            )}
            {detail.photos.length > 0 && (
              <>
                <h3>Fotos</h3>
                <div className="photos">
                  {detail.photos.map((src) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={src} src={src} alt={`Foto vom Check-in bei ${c.venueName}`} loading="lazy" />
                  ))}
                </div>
              </>
            )}
          </>
        )}
        {c.venueId && !demo && (
          <p className="small">
            <a href={`https://foursquare.com/v/${c.venueId}`} target="_blank" rel="noopener noreferrer">
              Ort bei Foursquare öffnen
            </a>
          </p>
        )}
      </div>
    </dialog>
  );
}
