import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED = [
  "/home",
  "/workbooks",
  "/quizzes",
  "/explore",
  "/creations",
  "/community",
  "/progress",
  "/profile",
  "/settings",
  "/notifications",
  "/help",
  "/search",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (isProtected && !getSessionCookie(request)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/home",
    "/workbooks/:path*",
    "/quizzes/:path*",
    "/explore/:path*",
    "/creations/:path*",
    "/community/:path*",
    "/progress/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/notifications/:path*",
    "/help/:path*",
    "/search/:path*",
  ],
};
