import dbConnect from "@/configs/db";
import { STATUS_CODES } from "@/constants/status-codes";

import { SignupSchema } from "@/validators/auth";
import { NextRequest } from "next/server";
import z from "zod";
import {
  checkRateLimit,
  getClientIP,
  hashPassword
} from "@/helpers/auth.helper";
import {
  OTP_CODE_EXPIRY,
  OTP_CODE_LENGTH,
  RATE_LIMIT_MAX_REQUESTS,
  RATE_LIMIT_WINDOW
} from "@/constants/auth-constants";
import Profile from "@/models/profile.model";
import { ApiResponse } from "@/utils/api-response";
import { AsyncHandler } from "@/utils/async-handler";
import redis from "@/configs/redis";
import {
  checkOtpRestrictions,
  sendOtp,
  trackOtpRequests
} from "@/helpers/otp.helper";
import { generateOTP } from "@/helpers/token.helper";
import { UserSignupData } from "@/types/auth";
import { logger } from "@/utils/logger";

export const POST = AsyncHandler(async (req: NextRequest) => {
  const formData = await req.json();
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

  const { success, data, error } = SignupSchema.safeParse(formData);
  await dbConnect();

  if (!success) {
    return ApiResponse({
      success: false,
      statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
      message: "Invalid data received!",
      error: z.flattenError(error).fieldErrors
    });
  }

  const { name, email, password, username } = data;
  if (!name || !email) {
    return ApiResponse({
      success: false,
      statusCode: STATUS_CODES.BAD_REQUEST,
      message: "Name and email are required"
    });
  }

  const existingUser = await Profile.findOne({
    $or: [{ email }, { username }]
  });

  if (existingUser) {
    return ApiResponse({
      success: false,
      statusCode: STATUS_CODES.CONFLICT,
      message: "User with this email or username already exists"
    });
  }

  const pending = await redis.get(`user:pending:${email}`);

  if (pending) {
    return ApiResponse({
      success: false,
      statusCode: STATUS_CODES.CONFLICT,
      message: "Signup already in progress. Check your email for OTP."
    });
  }

  const hashedPassword = await hashPassword(password);

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

  logger.info(`OTP generated successfully: ${code}`);

  const redisKey = `user:${email}:${hashCode}`;
  const indexKey = `user:pending:${email}`;

  await redis.set(redisKey, hashCode, {
    px: OTP_CODE_EXPIRY
  });

  await sendOtp({
    name,
    email,
    code,
    hashCode,
    type: "verify-email",
    subject: "Verify your email"
  });

  const userData: UserSignupData = {
    name,
    email,
    password: hashedPassword,
    username
  };

  await redis.set(indexKey, JSON.stringify(userData), {
    px: OTP_CODE_EXPIRY
  });

  return ApiResponse({
    success: true,
    statusCode: STATUS_CODES.CREATED,
    message: "User registered successfully"
  });
});
