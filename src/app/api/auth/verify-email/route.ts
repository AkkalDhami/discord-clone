import dbConnect from "@/configs/db";
import { STATUS_CODES } from "@/constants/status-codes";

import { NextRequest } from "next/server";
import { checkRateLimit, getClientIP } from "@/helpers/auth.helper";
import {
  RATE_LIMIT_MAX_REQUESTS,
  RATE_LIMIT_WINDOW
} from "@/constants/auth-constants";
import Profile from "@/models/profile.model";
import { ApiResponse } from "@/utils/api-response";
import { AsyncHandler } from "@/utils/async-handler";
import redis from "@/configs/redis";
import { verifyOtp } from "@/helpers/otp.helper";
import { generateHashedToken } from "@/helpers/token.helper";
import { UserSignupData, VerifyUser } from "@/types/auth";

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

  await dbConnect();

  const { email, otpCode } = req.json() as unknown as VerifyUser;

  if (!email || !otpCode) {
    return ApiResponse({
      success: false,
      statusCode: STATUS_CODES.BAD_REQUEST,
      message: "Email and OTP are required"
    });
  }

  const hashCode = generateHashedToken(otpCode);

  const otpResult = await verifyOtp(email, hashCode);
  if (!otpResult.success) {
    return ApiResponse({
      success: false,
      statusCode: otpResult.statusCode,
      message: otpResult.message
    });
  }

  const pendingUser = (await redis.get(`user:pending:${email}`)) as
    | string
    | null;
  if (!pendingUser) {
    return ApiResponse({
      success: false,
      statusCode: STATUS_CODES.NOT_FOUND,
      message: "No pending signup found for this email"
    });
  }

  const userData = JSON.parse(pendingUser) as UserSignupData;

  const newUser = new Profile({
    name: userData.name,
    email: userData.email,
    password: userData.password,
    username: userData.username,
    isEmailVerified: true,
    provider: "local"
  });

  if (!newUser) {
    return ApiResponse({
      success: false,
      statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: "Something went wrong. Please try again."
    });
  }

  await newUser.save();

  await redis.del(`user:${email}:${hashCode}`);
  await redis.del(`user:pending:${email}`);

  return ApiResponse({
    success: true,
    statusCode: STATUS_CODES.CREATED,
    message: "User verified successfully",
    data: {
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
        avatar: newUser.avatar
      }
    }
  });
});
