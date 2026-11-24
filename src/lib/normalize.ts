import type { Checkin, CheckinDetail, Place } from "./types";

/* Die Foursquare-Antworten sind nicht typisiert dokumentiert; deshalb wird hier
   bewusst defensiv gelesen. */
/* eslint-disable @typescript-eslint/no-explicit-any */

const num = (v: unknown): number | undefined =>
  typeof v === "number" && Number.isFinite(v) ? v : undefined;
const str = (v: unknown): string | undefined =>
  typeof v === "string" && v.trim() !== "" ? v : undefined;

/** v2: Element aus response.checkins.items */
export function normalizeCheckin(raw: any): Checkin | null {
  if (!raw || typeof raw.id !== "string") return null;
  const venue = raw.venue ?? {};
  const loc = venue.location ?? {};
  const categories: any[] = Array.isArray(venue.categories) ? venue.categories : [];
  const primary = categories.find((c) => c?.primary) ?? categories[0];
  return {
    id: raw.id,
    createdAt: num(raw.createdAt) ?? 0,
    tzOffset: num(raw.timeZoneOffset) ?? 0,
    shout: str(raw.shout),
    venueId: str(venue.id),
    venueName: str(venue.name) ?? "Unbekannter Ort",
    lat: num(loc.lat),
    lng: num(loc.lng),
    address: str(loc.address),
    city: str(loc.city),
    country: str(loc.country),
    category: str(primary?.name),
    photoCount: num(raw.photos?.count) ?? 0,
    commentCount: num(raw.comments?.count) ?? 0,
  };
}

/** v2: response.checkin (Detailabruf) */
export function normalizeCheckinDetail(raw: any): CheckinDetail | null {
  const base = normalizeCheckin(raw);
  if (!base) return null;
  const comments = (Array.isArray(raw.comments?.items) ? raw.comments.items : [])
    .filter((c: any) => str(c?.text))
    .map((c: any) => ({
      author: [str(c.user?.firstName), str(c.user?.lastName)].filter(Boolean).join(" ") || undefined,
      text: c.text as string,
      createdAt: num(c.createdAt),
    }));
  const photos = (Array.isArray(raw.photos?.items) ? raw.photos.items : [])
    .filter((p: any) => str(p?.prefix) && str(p?.suffix))
    .map((p: any) => `${p.prefix}cap600${p.suffix}`);
  return { ...base, comments, photos };
}

/** Neue Places API: Element aus results */
export function normalizePlace(raw: any): Place | null {
  const id = str(raw?.fsq_place_id) ?? str(raw?.fsq_id);
  if (!id) return null;
  const loc = raw.location ?? {};
  const main = raw.geocodes?.main ?? {};
  return {
    id,
    name: str(raw.name) ?? "(ohne Namen)",
    lat: num(raw.latitude) ?? num(main.latitude),
    lng: num(raw.longitude) ?? num(main.longitude),
    address: str(loc.address),
    city: str(loc.locality),
    postcode: str(loc.postcode),
    country: str(loc.country),
    category: str(raw.categories?.[0]?.name),
    distance: num(raw.distance),
    website: str(raw.website),
  };
}
