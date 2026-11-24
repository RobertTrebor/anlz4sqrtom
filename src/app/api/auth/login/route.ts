import { NextResponse } from "next/server";
import { config, oauthConfigured, redirectUri, STATE_COOKIE } from "@/lib/foursquare";

export async function GET(request: Request) {
  if (!oauthConfigured()) {
    return NextResponse.redirect(new URL("/?error=nicht_konfiguriert", request.url));
  }
  const state = crypto.randomUUID();
  const url = new URL("https://foursquare.com/oauth2/authenticate");
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", redirectUri(request.url));
  url.searchParams.set("state", state);

  const res = NextResponse.redirect(url);
  res.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  return res;
}
