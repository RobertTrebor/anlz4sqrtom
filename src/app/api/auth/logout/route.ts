import { NextResponse } from "next/server";
import { TOKEN_COOKIE } from "@/lib/foursquare";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(TOKEN_COOKIE);
  return res;
}
