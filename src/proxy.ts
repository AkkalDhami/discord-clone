import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const isPublic =
    request.nextUrl.pathname === "/signin" ||
    request.nextUrl.pathname === "/signup";

  const accessToken = request.cookies.get("accessToken")?.value;
  if (accessToken) {
    if (isPublic) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  } else {
    if (!isPublic) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }
  }
}

export const config = {
  matcher: ["/", "/signin", "/signup", "/profile"]
};
