import { errorResponse, getToken, v2 } from "@/lib/foursquare";
import { normalizeCheckinDetail } from "@/lib/normalize";

export const dynamic = "force-dynamic";

/** Einzelner Check-in inklusive Kommentaren und Fotos. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = await getToken();
  if (!token) return Response.json({ error: "Nicht angemeldet." }, { status: 401 });

  const { id } = await params;
  if (!/^[0-9a-f]{24}$/i.test(id)) return Response.json({ error: "Ungültige Check-in-ID." }, { status: 400 });

  try {
    const response = await v2(`checkins/${id}`, token);
    const detail = normalizeCheckinDetail(response?.checkin);
    if (!detail) return Response.json({ error: "Check-in nicht gefunden." }, { status: 404 });
    return Response.json(detail);
  } catch (e) {
    return errorResponse(e);
  }
}
