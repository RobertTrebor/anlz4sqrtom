import "server-only";
import { cookies } from "next/headers";

/** Versionsdatum für die v2-API (Pflichtparameter `v`). */
const V2_VERSION = "20250617";
const PLACES_VERSION = "2025-06-17";

export const TOKEN_COOKIE = "fsq_token";
export const STATE_COOKIE = "fsq_oauth_state";

export const config = {
  clientId: process.env.FSQ_CLIENT_ID ?? "",
  clientSecret: process.env.FSQ_CLIENT_SECRET ?? "",
  redirectUri: process.env.FSQ_REDIRECT_URI ?? "",
  serviceKey: process.env.FSQ_SERVICE_KEY ?? "",
};

export const oauthConfigured = () => Boolean(config.clientId && config.clientSecret);
export const placesConfigured = () => Boolean(config.serviceKey);

export function redirectUri(requestUrl: string): string {
  return config.redirectUri || new URL("/api/auth/callback", requestUrl).toString();
}

export class FoursquareError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function getToken(): Promise<string | undefined> {
  return (await cookies()).get(TOKEN_COOKIE)?.value;
}

async function readJson(res: Response): Promise<unknown> {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text.slice(0, 300) };
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Aufruf der v2-API (Swarm-Daten) mit dem OAuth-Token des Nutzers. */
export async function v2(path: string, token: string, params: Record<string, string> = {}): Promise<any> {
  const url = new URL(`https://api.foursquare.com/v2/${path}`);
  url.searchParams.set("v", V2_VERSION);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    cache: "no-store",
  });
  const body: any = await readJson(res);
  if (!res.ok) {
    const detail = body?.meta?.errorDetail ?? body?.meta?.errorType ?? body?.message ?? body?.raw ?? res.statusText;
    throw new FoursquareError(res.status, `Foursquare v2 (${res.status}): ${detail}`);
  }
  return body?.response ?? {};
}

/** Aufruf der neuen Places API mit dem Service Key. */
export async function places(path: string, params: Record<string, string>): Promise<any> {
  const url = new URL(`https://places-api.foursquare.com/${path}`);
  for (const [k, v] of Object.entries(params)) if (v) url.searchParams.set(k, v);
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${config.serviceKey}`,
      "X-Places-Api-Version": PLACES_VERSION,
      Accept: "application/json",
    },
    cache: "no-store",
  });
  const body: any = await readJson(res);
  if (!res.ok) {
    const detail = body?.message ?? body?.raw ?? res.statusText;
    throw new FoursquareError(res.status, `Foursquare Places (${res.status}): ${detail}`);
  }
  return body;
}

/** Tauscht den OAuth-Code gegen ein Access-Token. */
export async function exchangeCode(code: string, redirect: string): Promise<string> {
  const url = new URL("https://foursquare.com/oauth2/access_token");
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("client_secret", config.clientSecret);
  url.searchParams.set("grant_type", "authorization_code");
  url.searchParams.set("redirect_uri", redirect);
  url.searchParams.set("code", code);
  const res = await fetch(url, { cache: "no-store" });
  const body: any = await readJson(res);
  if (!res.ok || typeof body?.access_token !== "string") {
    throw new FoursquareError(res.status, `Token-Tausch fehlgeschlagen (${res.status}): ${body?.error ?? body?.raw ?? ""}`);
  }
  return body.access_token;
}

export function errorResponse(e: unknown): Response {
  if (e instanceof FoursquareError) {
    const status = e.status === 401 ? 401 : 502;
    return Response.json({ error: e.message }, { status });
  }
  console.error(e);
  return Response.json({ error: "Unerwarteter Fehler beim Abruf." }, { status: 500 });
}
