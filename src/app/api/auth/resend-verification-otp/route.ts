import dbConnect from "@/configs/db";
import redis from "@/configs/redis";
import {
  OTP_CODE_EXPIRY,
  OTP_CODE_LENGTH,
  RATE_LIMIT_MAX_REQUESTS,
  RATE_LIMIT_WINDOW
} from "@/constants/auth-constants";
import { STATUS_CODES } from "@/constants/status-codes";
import {
  checkOtpRestrictions,
  sendOtp,
  trackOtpRequests
} from "@/helpers/otp.helper";
import { generateOTP } from "@/helpers/token.helper";
import { checkRateLimit, getClientIP } from "@/helpers/auth.helper";
import { ApiResponse } from "@/utils/api-response";
import { AsyncHandler } from "@/utils/async-handler";
import { NextRequest } from "next/server";

export const POST = AsyncHandler(async (req: NextRequest) => {
  const clientIP = getClientIP(req);
  const rateLimit = checkRateLimit(clientIP);

  if (!rateLimit.allowed) {
    return ApiResponse({
      success: false,
      statusCode: STATUS_CODES.TOO_MANY_REQUESTS,
      message: "Too many requests. Please try again later.",
      error: {
        retryAfter: RATE_LIMIT_WINDOW / 1000,
        status: STATUS_CODES.TOO_MANY_REQUESTS,
        headers: {
          "X-RateLimit-Limit": RATE_LIMIT_MAX_REQUESTS.toString(),
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
          "X-RateLimit-Reset": (Date.now() + RATE_LIMIT_WINDOW).toString()
        }
      }
    });
  }

  const { email } = await req.json();

  if (!email) {
    return ApiResponse({
      success: false,
      statusCode: STATUS_CODES.BAD_REQUEST,
      message: "Email is required"
    });
  }

  await dbConnect();

  const pendingUser = await redis.get(`user:pending:${email}`);
  if (!pendingUser) {
    return ApiResponse({
      success: false,
      statusCode: STATUS_CODES.NOT_FOUND,
      message: "No pending signup found for this email"
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

  await redis.set(`user:${email}:${hashCode}`, pendingUser, {
    px: OTP_CODE_EXPIRY
  });

  await redis.set(`user:pending:${email}`, pendingUser, {
    px: OTP_CODE_EXPIRY
  });

  const sendOtpResult = await sendOtp({
    name: JSON.parse(pendingUser as string).name,
    email,
    code,
    hashCode,
    subject: "Verify your email",
    type: "verify-email"
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
    message: "Verification code resent successfully"
  });
});
