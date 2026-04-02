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
  RATE_LIMIT_MAX_REQUESTS,
  RATE_LIMIT_WINDOW
} from "@/constants/auth-constants";
import Profile from "@/models/profile.model";
import { ApiResponse } from "@/utils/api-response";
import { AsyncHandler } from "@/utils/async-handler";

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

  const { name, email, password } = data;
  if (!name || !email) {
    return ApiResponse({
      success: false,
      statusCode: STATUS_CODES.BAD_REQUEST,
      message: "Name and email are required"
    });
  }

  const existingUser = await Profile.findOne({ email }).select("+password");

  if (existingUser) {
    return ApiResponse({
      success: false,
      statusCode: STATUS_CODES.CONFLICT,
      message: "User with this email already exists"
    });
  }

  const hashedPassword = await hashPassword(password);

  const newUser = new Profile({
    name,
    email,
    password: hashedPassword
  });

  if (!newUser) {
    return ApiResponse({
      success: false,
      statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: "Something went wrong. Please try again."
    });
  }

  await newUser.save();

  return ApiResponse({
    success: true,
    statusCode: STATUS_CODES.CREATED,
    message: "User created successfully",
    data: {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email
    }
  });
});
