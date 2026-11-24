import { describe, expect, it } from "vitest";
import { demoCheckins } from "./demo";
import { normalizeCheckin, normalizeCheckinDetail, normalizePlace } from "./normalize";
import { computeStats, groupByVenue } from "./stats";
import type { Checkin } from "./types";

// Form einer v2-Antwort, wie sie die alte Bibliothek (fi.foyt.foursquare) geparst hat
const rawCheckin = {
  id: "5da30eaf120e640007e1a067",
  createdAt: 1571000000,
  timeZoneOffset: 120,
  shout: "Hallo",
  venue: {
    id: "4adcda10f964a520af3521e3",
    name: "Testort",
    location: { address: "Weg 1", city: "Berlin", country: "Deutschland", lat: 52.5, lng: 13.4 },
    categories: [{ name: "Bar" }, { name: "Café", primary: true }],
  },
  photos: { count: 1, items: [{ prefix: "https://example.test/img/", suffix: "/a.jpg" }] },
  comments: { count: 2, items: [{ text: "Hi", user: { firstName: "A", lastName: "B" } }, { text: "" }] },
};

describe("normalize", () => {
  it("liest einen v2-Check-in", () => {
    expect(normalizeCheckin(rawCheckin)).toEqual({
      id: "5da30eaf120e640007e1a067",
      createdAt: 1571000000,
      tzOffset: 120,
      shout: "Hallo",
      venueId: "4adcda10f964a520af3521e3",
      venueName: "Testort",
      lat: 52.5,
      lng: 13.4,
      address: "Weg 1",
      city: "Berlin",
      country: "Deutschland",
      category: "Café",
      photoCount: 1,
      commentCount: 2,
    });
  });

  it("verkraftet fehlende Felder und Müll", () => {
    expect(normalizeCheckin(null)).toBeNull();
    expect(normalizeCheckin({})).toBeNull();
    const c = normalizeCheckin({ id: "x" });
    expect(c?.venueName).toBe("Unbekannter Ort");
    expect(c?.lat).toBeUndefined();
    expect(c?.commentCount).toBe(0);
  });

  it("liest Kommentare und Fotos", () => {
    const d = normalizeCheckinDetail(rawCheckin);
    expect(d?.comments).toEqual([{ author: "A B", text: "Hi", createdAt: undefined }]);
    expect(d?.photos).toEqual(["https://example.test/img/cap600/a.jpg"]);
  });

  it("liest Orte der neuen Places API und des alten v3-Formats", () => {
    expect(
      normalizePlace({
        fsq_place_id: "p1",
        name: "Neu",
        latitude: 1,
        longitude: 2,
        location: { address: "A", locality: "B", postcode: "12345" },
        categories: [{ name: "Kino" }],
        distance: 40,
      }),
    ).toMatchObject({ id: "p1", lat: 1, lng: 2, city: "B", postcode: "12345", category: "Kino", distance: 40 });
    expect(normalizePlace({ fsq_id: "p2", geocodes: { main: { latitude: 3, longitude: 4 } } })).toMatchObject({
      id: "p2",
      lat: 3,
      lng: 4,
    });
    expect(normalizePlace({ name: "ohne id" })).toBeNull();
  });
});

const mk = (o: Partial<Checkin>): Checkin => ({
  id: Math.random().toString(36),
  createdAt: 0,
  tzOffset: 0,
  venueName: "X",
  photoCount: 0,
  commentCount: 0,
  ...o,
});

describe("stats", () => {
  it("zählt und sortiert", () => {
    const s = computeStats([
      mk({ venueId: "a", venueName: "A", city: "Berlin", country: "DE", category: "Café", createdAt: Date.UTC(2020, 0, 6, 9) / 1000 }),
      mk({ venueId: "a", venueName: "A", city: "Berlin", country: "DE", category: "Café", createdAt: Date.UTC(2021, 0, 5, 9) / 1000 }),
      mk({ venueId: "b", venueName: "B", city: "Porto", country: "PT", createdAt: Date.UTC(2021, 5, 6, 23, 30) / 1000, tzOffset: 60 }),
    ]);
    expect(s.total).toBe(3);
    expect(s.uniqueVenues).toBe(2);
    expect(s.uniqueCities).toBe(2);
    expect(s.uniqueCountries).toBe(2);
    expect(s.topVenues[0]).toEqual({ label: "A", count: 2 });
    expect(s.byYear).toEqual([{ label: "2020", count: 1 }, { label: "2021", count: 2 }]);
    // 6.1.2020 = Montag, 5.1.2021 = Dienstag; 6.6.2021 23:30 UTC + 60 min = Montag 0:30 Ortszeit
    expect(s.byWeekday.map((d) => d.count)).toEqual([2, 1, 0, 0, 0, 0, 0]);
    expect(s.byHour[9].count).toBe(2);
    expect(s.byHour[0].count).toBe(1);
    expect(s.first).toBe(Date.UTC(2020, 0, 6, 9) / 1000);
  });

  it("fasst Orte für die Karte zusammen und lässt Orte ohne Koordinaten aus", () => {
    const pts = groupByVenue([
      mk({ venueId: "a", lat: 1, lng: 2 }),
      mk({ venueId: "a", lat: 1, lng: 2 }),
      mk({ venueId: "b" }),
    ]);
    expect(pts).toHaveLength(1);
    expect(pts[0].count).toBe(2);
  });

  it("Demo-Daten sind deterministisch und konsistent", () => {
    const a = demoCheckins(200);
    expect(a).toEqual(demoCheckins(200));
    expect(computeStats(a).total).toBe(200);
    expect(new Set(a.map((c) => c.id)).size).toBe(200);
  });
});
