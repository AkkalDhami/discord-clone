import dbConnect from "@/configs/db";
import { STATUS_CODES } from "@/constants/status-codes";

import { ForgotPasswordSchema } from "@/validators/auth";
import { NextRequest, NextResponse } from "next/server";
import {
  OTP_CODE_LENGTH,
  RESET_PASSWORD_TOKEN_EXPIRY
} from "@/constants/auth-constants";
import { ApiResponse } from "@/utils/api-response";
import { AsyncHandler } from "@/utils/async-handler";
import { validateRequest } from "@/lib/validation";
import {
  checkOtpRestrictions,
  sendOtp,
  trackOtpRequests
} from "@/helpers/otp.helper";
import { generateOTP } from "@/helpers/token.helper";
import redis from "@/configs/redis";
import { logger } from "@/utils/logger";
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

  const result = validateRequest(ForgotPasswordSchema, formData);
  await dbConnect();

  if (!result.success) {
    return ApiResponse({
      success: false,
      statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
      message: "Invalid data received!",
      error: result.errors
    });
  }

  const { email } = result.data;
  if (!email) {
    return ApiResponse({
      success: false,
      statusCode: STATUS_CODES.BAD_REQUEST,
      message: "Email is required"
    });
  }

  const otpRestrictionResult = await checkOtpRestrictions(email);
  if (!otpRestrictionResult.success) {
    return ApiResponse({
      success: false,
      statusCode: otpRestrictionResult.statusCode,
      message: otpRestrictionResult.message
    });
  }

  const trackOtpResult = await trackOtpRequests(email);
  if (!trackOtpResult.success) {
    return ApiResponse({
      success: false,
      statusCode: trackOtpResult.statusCode,
      message: trackOtpResult.message
    });
  }

  const { code, hashCode } = generateOTP(OTP_CODE_LENGTH);

  const redisKey = `reset_password:${email}:${hashCode}`;

  await redis.set(redisKey, hashCode, {
    px: RESET_PASSWORD_TOKEN_EXPIRY
  });

  logger.info(`Reset password code: ${code}`);

  const sendOtpResult = await sendOtp({
    name: email,
    email,
    code,
    hashCode,
    subject: "Reset Password Code",
    type: "reset-password"
  });

  if (!sendOtpResult.success) {
    return ApiResponse({
      success: false,
      statusCode: sendOtpResult.statusCode,
      message: sendOtpResult.message
    });
  }

  return ApiResponse({
    success: true,
    statusCode: STATUS_CODES.OK,
    message: `Reset password otp sent to <${email}>`
  });
});
