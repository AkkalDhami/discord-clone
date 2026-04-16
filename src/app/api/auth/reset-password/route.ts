import dbConnect from "@/configs/db";
import { STATUS_CODES } from "@/constants/status-codes";

import { ResetPasswordSchema } from "@/validators/auth";
import { NextRequest } from "next/server";
import { RESET_PASSWORD_TOKEN_EXPIRY } from "@/constants/auth-constants";
import { ApiResponse } from "@/utils/api-response";
import { AsyncHandler } from "@/utils/async-handler";
import { validateRequest } from "@/lib/validation";
import { verifyOtp } from "@/helpers/otp.helper";
import { generateHashedToken } from "@/helpers/token.helper";
import redis from "@/configs/redis";

export const POST = AsyncHandler(async (req: NextRequest) => {
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

  const hashedCode = generateHashedToken(email);

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
