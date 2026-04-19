import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import Profile from "@/models/profile.model";
import dbConnect from "@/configs/db";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} from "@/lib/jwt";
import { setAuthCookies } from "@/helpers/auth.helper";
import { ratelimit } from "@/utils/rate-limiter";

const publicRoutes = ["/signin", "/signup"];

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isPublic = publicRoutes.includes(pathname);

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "127.0.0.1";

  const { success, limit, remaining } = await ratelimit.limit(ip);
  const response = NextResponse.next();
  if (!success) {
    response.headers.set("X-RateLimit-Success", success.toString());
    response.headers.set("X-RateLimit-Limit", limit.toString());
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    return response;
  }

  const accessToken = request.cookies.get("accessToken")?.value;

  if (accessToken && isPublic) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!accessToken) {
    const refreshToken = request.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }

    const decodedRefreshToken = verifyRefreshToken(refreshToken);

    if (decodedRefreshToken?.sub) {
      const { sub: userId } = decodedRefreshToken;

      await dbConnect();

      const user = await Profile.findOne({ _id: userId });

      if (!user) {
        return NextResponse.redirect(new URL("/signin", request.url));
      }

      const newAccessToken = signAccessToken({
        sub: user._id.toString(),
        email: user.email
      });

      const newRefreshToken = signRefreshToken({
        sub: user._id.toString()
      });

      await setAuthCookies(newAccessToken, newRefreshToken);
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/signin", "/signup", "/profile"]
};
