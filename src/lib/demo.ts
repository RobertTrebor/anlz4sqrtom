import type { Checkin } from "./types";

/** Erfundene Beispieldaten, damit sich die App ohne Foursquare-Zugang ansehen lässt. */
const VENUES: Array<[string, string, string, string, number, number, number]> = [
  // Name, Kategorie, Stadt, Land, lat, lng, Gewicht
  ["Beispiel-Café am Park", "Café", "Berlin", "Deutschland", 52.5312, 13.4039, 30],
  ["Musterbahnhof", "Bahnhof", "Berlin", "Deutschland", 52.5251, 13.3694, 22],
  ["Spreeufer (Demo)", "Uferpromenade", "Berlin", "Deutschland", 52.5169, 13.4019, 18],
  ["Demo-Supermarkt", "Supermarkt", "Berlin", "Deutschland", 52.5391, 13.4132, 25],
  ["Stadtbibliothek (Demo)", "Bibliothek", "Hamburg", "Deutschland", 53.5503, 10.0006, 9],
  ["Testkino", "Kino", "Hamburg", "Deutschland", 53.5560, 9.9870, 6],
  ["Beispiel-Sportstudio", "Fitnessstudio", "Berlin", "Deutschland", 52.5290, 13.3950, 14],
  ["Flughafen (Demo)", "Flughafen", "München", "Deutschland", 48.3538, 11.7861, 7],
  ["Pastelaria Exemplo", "Bäckerei", "Lissabon", "Portugal", 38.7139, -9.1394, 5],
  ["Demo-Kaffeehaus", "Café", "Wien", "Österreich", 48.2082, 16.3738, 3],
  ["Musterbiergarten", "Biergarten", "München", "Deutschland", 48.1374, 11.5755, 8],
  ["Demo-Museum", "Museum", "Berlin", "Deutschland", 52.5200, 13.3980, 4],
];

/** Kleiner deterministischer Zufallsgenerator (mulberry32). */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function demoCheckins(count = 600, seed = 42): Checkin[] {
  const rand = rng(seed);
  const totalWeight = VENUES.reduce((s, v) => s + v[6], 0);
  const start = Date.UTC(2012, 0, 1) / 1000;
  const end = Date.UTC(2026, 9, 31) / 1000;
  const out: Checkin[] = [];
  for (let i = 0; i < count; i++) {
    let pick = rand() * totalWeight;
    let v = VENUES[0];
    for (const cand of VENUES) {
      pick -= cand[6];
      if (pick <= 0) {
        v = cand;
        break;
      }
    }
    const day = Math.floor(start + rand() * (end - start));
    const hour = 7 + Math.floor(rand() * 15);
    const createdAt = day - (day % 86400) + hour * 3600 + Math.floor(rand() * 3600) - 3600;
    const hasComment = rand() < 0.08;
    out.push({
      id: `demo-${i}`,
      createdAt,
      tzOffset: 60,
      shout: rand() < 0.12 ? "Beispieltext zu diesem Check-in" : undefined,
      venueId: `demo-venue-${VENUES.indexOf(v)}`,
      venueName: v[0],
      category: v[1],
      city: v[2],
      country: v[3],
      lat: v[4],
      lng: v[5],
      address: "Musterstraße 1",
      photoCount: 0,
      commentCount: hasComment ? 1 : 0,
    });
  }
  return out.sort((a, b) => b.createdAt - a.createdAt);
}
