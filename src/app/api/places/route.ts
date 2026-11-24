import { errorResponse, places, placesConfigured } from "@/lib/foursquare";
import { normalizePlace } from "@/lib/normalize";
import type { Place } from "@/lib/types";

export const dynamic = "force-dynamic";

const FIELDS = "fsq_place_id,name,latitude,longitude,location,categories,distance,website";

/** Ortssuche über die neue Places API (ersetzt das alte venues/search). */
export async function GET(request: Request) {
  if (!placesConfigured()) {
    return Response.json({ error: "FSQ_SERVICE_KEY ist nicht gesetzt." }, { status: 503 });
  }
  const q = new URL(request.url).searchParams;
  const ll = q.get("ll") ?? "";
  if (!/^-?\d{1,2}(\.\d+)?,-?\d{1,3}(\.\d+)?$/.test(ll)) {
    return Response.json({ error: "Parameter ll (Breite,Länge) fehlt oder ist ungültig." }, { status: 400 });
  }
  const category = q.get("category") ?? "";
  if (category && !/^[0-9a-f]{24}$/i.test(category)) {
    return Response.json({ error: "Ungültige Kategorie." }, { status: 400 });
  }
  const radius = Math.min(Math.max(Number(q.get("radius")) || 2000, 100), 100000);

  try {
    const body = await places("places/search", {
      ll,
      query: (q.get("query") ?? "").slice(0, 100),
      fsq_category_ids: category,
      radius: String(Math.round(radius)),
      limit: "50",
      fields: FIELDS,
    });
    const raw: unknown[] = Array.isArray(body?.results) ? body.results : [];
    const results = raw.map(normalizePlace).filter((p): p is Place => p !== null);
    return Response.json({ results });
  } catch (e) {
    return errorResponse(e);
  }
}
