import { NextResponse, type NextRequest } from "next/server";
import { DEMO_LEVEL_COOKIE } from "@/lib/demo-constants";

const PROTECTED = [
  "/",
  "/workbooks",
  "/subjects",
  "/quizzes",
  "/explore",
  "/creations",
  "/progress",
  "/profile",
  "/settings",
  "/notifications",
  "/help",
  "/search",
  "/pending",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (isProtected && !request.cookies.has(DEMO_LEVEL_COOKIE)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/workbooks/:path*",
    "/subjects/:path*",
    "/quizzes/:path*",
    "/explore/:path*",
    "/creations/:path*",
    "/progress/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/notifications/:path*",
    "/help/:path*",
    "/search/:path*",
    "/pending/:path*",
  ],
};
