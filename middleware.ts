import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge-level guard: if a request hits a protected route without ANY auth cookie,
 * we redirect straight to /login. We can't fully verify the JWT here (jsonwebtoken
 * doesn't run in the edge runtime), so the second pass — JWT verification + plan
 * check — happens in the (academy) layout / API routes.
 */
const PUBLIC_PATHS = new Set([
  "/login",
  "/api/auth/login",
  "/favicon.ico",
  "/robots.txt",
]);

const PUBLIC_PREFIXES = ["/_next", "/static", "/public", "/assets"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return NextResponse.next();

  const token =
    req.cookies.get("zaptick_token")?.value ||
    req.cookies.get("token")?.value ||
    req.cookies.get("zaptick-auth")?.value;

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
