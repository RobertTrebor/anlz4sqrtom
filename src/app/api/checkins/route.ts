import { errorResponse, getToken, v2 } from "@/lib/foursquare";
import { normalizeCheckin } from "@/lib/normalize";
import type { Checkin } from "@/lib/types";

export const dynamic = "force-dynamic";

const PAGE = 250; // laut Doku das Maximum pro Abruf

/** Eine Seite der Check-in-Historie. Der Client blättert über `offset`. */
export async function GET(request: Request) {
  const token = await getToken();
  if (!token) return Response.json({ error: "Nicht angemeldet." }, { status: 401 });

  const raw = Number(new URL(request.url).searchParams.get("offset") ?? "0");
  const offset = Number.isInteger(raw) && raw >= 0 ? raw : 0;

  try {
    const response = await v2("users/self/checkins", token, {
      limit: String(PAGE),
      offset: String(offset),
      sort: "newestfirst",
    });
    const rawItems: unknown[] = Array.isArray(response?.checkins?.items) ? response.checkins.items : [];
    const items = rawItems.map(normalizeCheckin).filter((c): c is Checkin => c !== null);
    return Response.json({
      total: typeof response?.checkins?.count === "number" ? response.checkins.count : undefined,
      received: rawItems.length,
      items,
    });
  } catch (e) {
    return errorResponse(e);
  }
}
