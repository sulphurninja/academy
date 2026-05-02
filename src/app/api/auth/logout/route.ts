import { NextResponse } from "next/server";
import { ACADEMY_AUTH_COOKIE } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.redirect(
    new URL("/login", process.env.NEXT_PUBLIC_ACADEMY_URL || "http://localhost:3001")
  );
  const cookieDomain = process.env.COOKIE_DOMAIN || undefined;
  res.cookies.set(ACADEMY_AUTH_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    ...(cookieDomain ? { domain: cookieDomain } : {}),
  });
  return res;
}
