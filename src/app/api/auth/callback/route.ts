import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeCode, redirectUri, STATE_COOKIE, TOKEN_COOKIE } from "@/lib/foursquare";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expected = (await cookies()).get(STATE_COOKIE)?.value;

  const fail = (reason: string) => {
    const res = NextResponse.redirect(new URL(`/?error=${reason}`, request.url));
    res.cookies.delete(STATE_COOKIE);
    return res;
  };

  if (!code) return fail("login_abgebrochen");
  // CSRF-Schutz: Der Login muss in diesem Browser gestartet worden sein (Cookie vorhanden).
  // Die v2-Doku erwähnt `state` nicht; kommt er zurück, muss er passen.
  if (!expected || (state !== null && state !== expected)) return fail("state_ungueltig");

  try {
    const token = await exchangeCode(code, redirectUri(request.url));
    const res = NextResponse.redirect(new URL("/", request.url));
    res.cookies.delete(STATE_COOKIE);
    res.cookies.set(TOKEN_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 90,
    });
    return res;
  } catch (e) {
    console.error(e);
    return fail("token_tausch");
  }
}
