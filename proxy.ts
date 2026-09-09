import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, isValidSessionToken } from "@/app/lib/auth";

/**
 * Optimistic auth gate for page navigation: redirects to /login when the
 * session cookie is missing/invalid. This alone isn't a full auth solution
 * (Server Actions POST to their own route and are checked independently via
 * `requireAuth()` in `app/lib/auth.ts`) — see the Data Security guidance in
 * the Proxy docs.
 */
export function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (isValidSessionToken(token)) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!login|_next/static|_next/image|favicon.ico|manifest.webmanifest|icons/|.*\\.svg$).*)",
  ],
};
