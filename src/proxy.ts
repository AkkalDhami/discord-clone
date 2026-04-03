import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/signin", "/signup"];

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isPublic = publicRoutes.includes(pathname);

  const accessToken = request.cookies.get("accessToken")?.value;

  if (accessToken && isPublic) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!accessToken && !isPublic) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/signin", "/signup", "/profile"]
};
