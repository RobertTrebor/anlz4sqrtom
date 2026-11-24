import type { Checkin } from "./types";

export interface Ranked {
  label: string;
  count: number;
}

export interface Stats {
  total: number;
  uniqueVenues: number;
  uniqueCities: number;
  uniqueCountries: number;
  first?: number;
  last?: number;
  topVenues: Ranked[];
  topCities: Ranked[];
  topCategories: Ranked[];
  byYear: Ranked[];
  /** Montag … Sonntag */
  byWeekday: Ranked[];
  /** 0 … 23 Uhr, Ortszeit des Check-ins */
  byHour: Ranked[];
}

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

/** Datum in der Ortszeit des Check-ins (als UTC-Felder ablesbar). */
export function localDate(c: Pick<Checkin, "createdAt" | "tzOffset">): Date {
  return new Date((c.createdAt + c.tzOffset * 60) * 1000);
}

function rank(map: Map<string, number>, limit: number): Ranked[] {
  return [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, limit);
}

const bump = (map: Map<string, number>, key: string | undefined) => {
  if (key) map.set(key, (map.get(key) ?? 0) + 1);
};

export function computeStats(checkins: Checkin[], top = 10): Stats {
  const venues = new Map<string, number>();
  const venueNames = new Map<string, string>();
  const cities = new Map<string, number>();
  const countries = new Set<string>();
  const categories = new Map<string, number>();
  const years = new Map<string, number>();
  const weekday = new Array<number>(7).fill(0);
  const hour = new Array<number>(24).fill(0);
  let first: number | undefined;
  let last: number | undefined;

  for (const c of checkins) {
    const key = c.venueId ?? `name:${c.venueName}`;
    bump(venues, key);
    venueNames.set(key, c.venueName);
    bump(cities, c.city);
    bump(categories, c.category);
    if (c.country) countries.add(c.country);
    if (c.createdAt > 0) {
      const d = localDate(c);
      bump(years, String(d.getUTCFullYear()));
      weekday[(d.getUTCDay() + 6) % 7]++;
      hour[d.getUTCHours()]++;
      if (first === undefined || c.createdAt < first) first = c.createdAt;
      if (last === undefined || c.createdAt > last) last = c.createdAt;
    }
  }

  return {
    total: checkins.length,
    uniqueVenues: venues.size,
    uniqueCities: cities.size,
    uniqueCountries: countries.size,
    first,
    last,
    topVenues: rank(venues, top).map((r) => ({ ...r, label: venueNames.get(r.label) ?? r.label })),
    topCities: rank(cities, top),
    topCategories: rank(categories, top),
    byYear: [...years.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => a.label.localeCompare(b.label)),
    byWeekday: weekday.map((count, i) => ({ label: WEEKDAYS[i], count })),
    byHour: hour.map((count, i) => ({ label: String(i), count })),
  };
}

export interface VenuePoint {
  key: string;
  name: string;
  lat: number;
  lng: number;
  count: number;
  detail?: string;
}

/** Check-ins je Ort zusammenfassen – für die Karte. */
export function groupByVenue(checkins: Checkin[]): VenuePoint[] {
  const points = new Map<string, VenuePoint>();
  for (const c of checkins) {
    if (c.lat === undefined || c.lng === undefined) continue;
    const key = c.venueId ?? `${c.lat},${c.lng}`;
    const p = points.get(key);
    if (p) p.count++;
    else
      points.set(key, {
        key,
        name: c.venueName,
        lat: c.lat,
        lng: c.lng,
        count: 1,
        detail: [c.category, c.city].filter(Boolean).join(" · ") || undefined,
      });
  }
  return [...points.values()];
}
