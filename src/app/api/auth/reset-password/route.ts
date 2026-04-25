import dbConnect from "@/configs/db";
import { STATUS_CODES } from "@/constants/status-codes";

import { ResetPasswordSchema } from "@/validators/auth";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/utils/api-response";
import { AsyncHandler } from "@/utils/async-handler";
import { validateRequest } from "@/lib/validation";
import redis from "@/configs/redis";
import { hashPassword, verifyPassword } from "@/helpers/auth.helper";
import Profile from "@/models/profile.model";
import { getRemainingTime } from "@/utils/date";
import { ratelimit } from "@/utils/rate-limiter";

export const POST = AsyncHandler(async (req: NextRequest) => {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "127.0.0.1";
  const { success, limit, remaining, reset } = await ratelimit.limit(ip);

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

  const result = validateRequest(ResetPasswordSchema, formData);
  await dbConnect();

  if (!result.success) {
    return ApiResponse({
      success: false,
      statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
      message: "Invalid data received!",
      error: result.errors
    });
  }

  const { email, newPassword } = result.data;
  if (!email || !newPassword) {
    return ApiResponse({
      success: false,
      statusCode: STATUS_CODES.BAD_REQUEST,
      message: "Email and password fields are required"
    });
  }

  const user = await Profile.findOne({ email }).select("+password");
  if (!user) {
    return ApiResponse({
      success: false,
      statusCode: STATUS_CODES.UNAUTHORIZED,
      message: "Unauthorized access"
    });
  }

  if (user?.provider === "google") {
    return ApiResponse({
      success: false,
      statusCode: STATUS_CODES.UNAUTHORIZED,
      message: "This account uses Google login. Please sign in with Google."
    });
  }

  if (user?.provider === "github") {
    return ApiResponse({
      success: false,
      statusCode: STATUS_CODES.UNAUTHORIZED,
      message: "This account uses GitHub login. Please sign in with GitHub."
    });
  }

  console.log({
    user
  });

  if (user.lockUntil && new Date(user.lockUntil) > new Date()) {
    return ApiResponse({
      success: false,
      statusCode: STATUS_CODES.FORBIDDEN,
      message: `Your account has been locked. Please try again after ${
        getRemainingTime(user.lockUntil).minutes
      } minutes and ${getRemainingTime(user.lockUntil).seconds} seconds.`
    });
  }

  const redisKey = `reset_password:status:${email}`;
  const status = await redis.get(redisKey);
  if (status !== "pending") {
    return ApiResponse({
      success: false,
      statusCode: STATUS_CODES.UNAUTHORIZED,
      message:
        "Please request a password reset before attempting to set a new password."
    });
  }

  const oldPassword = user?.password;

  const isOldPassword = await verifyPassword(newPassword, oldPassword || "");

  if (isOldPassword) {
    return ApiResponse({
      success: false,
      statusCode: STATUS_CODES.BAD_REQUEST,
      message: "New password cannot be the same as the old password."
    });
  }

  const hashedPassword = await hashPassword(newPassword);
  await Profile.updateOne(
    {
      email
    },
    {
      $set: {
        password: hashedPassword
      }
    }
  );

  await redis.del(redisKey);

  return ApiResponse({
    success: true,
    statusCode: STATUS_CODES.OK,
    message: "Password reset successfully. Please login with your new password."
  });
});
