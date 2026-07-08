import { STATUS_CODES } from "@/constants/status-codes";
import {
  currentAuthUser,
  hashPassword,
  verifyPassword
} from "@/helpers/auth.helper";
import { validateRequest } from "@/lib/validation";
import Profile from "@/models/profile.model";
import { ApiResponse } from "@/utils/api-response";
import { AsyncHandler } from "@/utils/async-handler";
import { ratelimit } from "@/utils/rate-limiter";
import { ChangePasswordSchema } from "@/validators/auth";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const POST = AsyncHandler(async (req: NextRequest) => {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "127.0.0.1";
  const { success, limit, remaining, reset } = await ratelimit.limit(ip);

  const cookieStore = await cookies();

  if (!success) {
    return NextResponse.json(
      {
        message: "Too many requests, please try again later."
      },
      {
        status: STATUS_CODES.TOO_MANY_REQUESTS,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString()
        }
      }
    );
  }
  const formData = await req.json();

  const result = validateRequest(ChangePasswordSchema, formData);
  if (!result.success) {
    return ApiResponse({
      success: false,
      statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
      message: "Invalid data received!",
      error: result.errors
    });
  }

  const user = await currentAuthUser();
  if (!user) {
    return ApiResponse({
      success: false,
      statusCode: STATUS_CODES.UNAUTHORIZED,
      message: "Unauthorized"
    });
  }

  if (!user.isEmailVerified) {
    return ApiResponse({
      success: false,
      statusCode: STATUS_CODES.FORBIDDEN,
      message: "Please verify your email first."
    });
  }

  const { currentPassword: oldPassword, newPassword } = result.data;

  const profile = await Profile.findOne({ user: user.id }).select("+password");

  if (!profile?.password) {
    return ApiResponse({
      success: false,
      statusCode: STATUS_CODES.BAD_REQUEST,
      message: "Password login is not enabled for this account"
    });
  }

  const isOldPassword = await verifyPassword(
    oldPassword,
    profile?.password || ""
  );

  if (!isOldPassword) {
    return ApiResponse({
      success: false,
      statusCode: STATUS_CODES.UNAUTHORIZED,
      message: "Invalid old password"
    });
  }

  if (oldPassword === newPassword)
    return ApiResponse({
      success: false,
      statusCode: STATUS_CODES.BAD_REQUEST,
      message: "New password cannot be the same as old password"
    });

  const hashedPassword = await hashPassword(newPassword);

  profile.password = hashedPassword;
  await profile.save();

  cookieStore.set("refreshToken", "", {
    expires: new Date(0),
    path: "/"
  });

  cookieStore.set("accessToken", "", {
    expires: new Date(0),
    path: "/"
  });

  return ApiResponse({
    success: true,
    statusCode: STATUS_CODES.OK,
    message: "Password changed successfully. Please login again!"
  });
});
