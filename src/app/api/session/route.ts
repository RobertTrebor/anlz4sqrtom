import { getToken, oauthConfigured, placesConfigured } from "@/lib/foursquare";
import type { SessionInfo } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const info: SessionInfo = {
    configured: oauthConfigured(),
    placesConfigured: placesConfigured(),
    loggedIn: Boolean(await getToken()),
  };
  return Response.json(info);
}
