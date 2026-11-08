import { NextResponse, type NextRequest } from "next/server";
import { DEMO_LEVEL_COOKIE } from "@/lib/demo-constants";

const PROTECTED = ["/", "/pending"];

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
  matcher: ["/", "/pending/:path*"],
};
