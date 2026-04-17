import dbConnect from "@/configs/db";
import { STATUS_CODES } from "@/constants/status-codes";
import { ApiResponse } from "@/utils/api-response";
import { SigninSchema } from "@/validators/auth";
import { NextRequest } from "next/server";
import z from "zod";
import {
  checkRateLimit,
  getClientIP,
  setAuthCookies,
  verifyPassword
} from "@/helpers/auth.helper";
import {
  LOCK_TIME_MS,
  LOGIN_MAX_ATTEMPTS,
  RATE_LIMIT_MAX_REQUESTS,
  RATE_LIMIT_WINDOW
} from "@/constants/auth-constants";
import Profile from "@/models/profile.model";
import { AsyncHandler } from "@/utils/async-handler";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";

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

  const formData = await req.json();
  const { success, data, error } = SigninSchema.safeParse(formData);
  await dbConnect();
  if (!success) {
    return ApiResponse({
      success: false,
      statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
      message: "Invalid data received!",
      error: z.flattenError(error).fieldErrors
    });
  }

  const { email, password } = data;
  if (!email || !password) {
    return ApiResponse({
      success: false,
      statusCode: STATUS_CODES.BAD_REQUEST,
      message: "Email and password are required"
    });
  }

  const existingUser = await Profile.findOne({ email }).select("+password");

  if (!existingUser) {
    return ApiResponse({
      success: false,
      statusCode: STATUS_CODES.UNAUTHORIZED,
      message: "Invalid email or password"
    });
  }

  if (existingUser?.provider === "google") {
    return ApiResponse({
      success: false,
      statusCode: STATUS_CODES.UNAUTHORIZED,
      message: "This account uses Google login. Please sign in with Google."
    });
  }

  if (existingUser?.provider === "github") {
    return ApiResponse({
      success: false,
      statusCode: STATUS_CODES.UNAUTHORIZED,
      message: "This account uses GitHub login. Please sign in with GitHub."
    });
  }

  const ispasswordMatched = await verifyPassword(
    password,
    existingUser?.password || ""
  );

  if (!ispasswordMatched) {
    let lockUntil = null;

    const newAttempts = (existingUser?.failedLoginAttempts || 0) + 1;

    if (newAttempts >= LOGIN_MAX_ATTEMPTS) {
      lockUntil = new Date(Date.now() + LOCK_TIME_MS);
    }

    await Profile.updateOne(
      { _id: existingUser._id },
      { $set: { failedLoginAttempts: newAttempts, lockUntil } }
    );
    return ApiResponse({
      success: false,
      statusCode: STATUS_CODES.UNAUTHORIZED,
      message: "Invalid email or password"
    });
  }

  await Profile.updateOne(
    { _id: existingUser._id },
    { $set: { failedLoginAttempts: 0, lockUntil: null } }
  );

  const accessToken = signAccessToken({
    sub: existingUser._id.toString(),
    email: existingUser.email
  });

  const refreshToken = signRefreshToken({
    sub: existingUser._id.toString()
  });

  await setAuthCookies(accessToken, refreshToken);

  return ApiResponse({
    success: true,
    statusCode: STATUS_CODES.OK,
    message: "User signed in successfully",
    data: {
      _id: existingUser._id,
      name: existingUser.name,
      email: existingUser.email
    }
  });
});
