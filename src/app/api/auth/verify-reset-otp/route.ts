import dbConnect from "@/configs/db";
import { STATUS_CODES } from "@/constants/status-codes";

import { VerifyResetOtpSchema } from "@/validators/auth";
import { NextRequest, NextResponse } from "next/server";
import { RESET_PASSWORD_TOKEN_EXPIRY } from "@/constants/auth-constants";
import { ApiResponse } from "@/utils/api-response";
import { AsyncHandler } from "@/utils/async-handler";
import { validateRequest } from "@/lib/validation";
import { verifyOtp } from "@/helpers/otp.helper";
import { generateHashedToken } from "@/helpers/token.helper";
import redis from "@/configs/redis";
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

  const result = validateRequest(VerifyResetOtpSchema, formData);
  await dbConnect();

  if (!result.success) {
    return ApiResponse({
      success: false,
      statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
      message: "Invalid data received!",
      error: result.errors
    });
  }

  const { email, otp } = result.data;
  if (!email || !otp) {
    return ApiResponse({
      success: false,
      statusCode: STATUS_CODES.BAD_REQUEST,
      message: "Email and OTP are required"
    });
  }

  const hashedCode = generateHashedToken(otp);

  const redisKey = `reset_password:${email}:${hashedCode}`;
  const storedHashCode = (await redis.get(redisKey)) as string;
  if (!storedHashCode) {
    return ApiResponse({
      success: false,
      statusCode: STATUS_CODES.UNAUTHORIZED,
      message: "Invalid or expired otp"
    });
  }

  const verifyOtpResult = await verifyOtp(email, storedHashCode);

  if (!verifyOtpResult.success) {
    return ApiResponse({
      success: false,
      statusCode: verifyOtpResult.statusCode,
      message: verifyOtpResult.message
    });
  }

  await redis.del(redisKey);

  await redis.set(`reset_password:status:${email}`, "pending", {
    px: RESET_PASSWORD_TOKEN_EXPIRY
  });

  return ApiResponse({
    success: true,
    statusCode: STATUS_CODES.OK,
    message:
      "Reset password otp verified successfully. Please reset your password."
  });
});
