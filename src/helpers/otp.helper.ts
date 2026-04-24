import redis from "@/configs/redis";
import {
  OTP_MAX_ATTEMPTS,
  OTP_COOL_DOWN,
  OTP_CODE_LENGTH,
  OTP_CODE_EXPIRY,
  OTP_SPAM_LOCK_TIME
} from "@/constants/auth-constants";
import { STATUS_CODES } from "@/constants/status-codes";
import { ApiResponse } from "@/interface/response";
import { SendOtpType } from "@/types/auth";
import { logger } from "@/utils/logger";
import { generateOTP } from "./token.helper";
import { sendEmail } from "@/utils/send-email";

export async function checkOtpRestrictions(
  email: string
): Promise<ApiResponse> {
  const otpLock = await redis.get(`otp_lock:${email}`);
  if (otpLock) {
    return {
      success: false,
      statusCode: STATUS_CODES.BAD_REQUEST,
      message:
        "Your Account is locked due to multiple failed attempts. Please try again after 30 minutes."
    };
  }

  if (await redis.get(`otp_spam_lock:${email}`)) {
    return {
      success: false,
      statusCode: STATUS_CODES.BAD_REQUEST,
      message:
        "Too many otp requests. Please try again after 1 hour before requesting again."
    };
  }

  if (await redis.get(`otp_cooldown:${email}`)) {
    return {
      success: false,
      statusCode: STATUS_CODES.FORBIDDEN,
      message: `Too many otp requests. Please try again after ${OTP_COOL_DOWN / (1000 * 60)} minutes before requesting new otp.`
    };
  }

  return {
    success: true,
    statusCode: STATUS_CODES.CREATED,
    message: "Otp restrictions checked successfully."
  };
}

export async function trackOtpRequests(email: string): Promise<ApiResponse> {
  try {
    const otpRequestKey = `otp_request_count:${email}`;
    const otpRequestsCount = parseInt((await redis.get(otpRequestKey)) || "0");

    if (otpRequestsCount >= OTP_MAX_ATTEMPTS) {
      await redis.set(`otp_spam_lock:${email}`, "locked", {
        px: OTP_SPAM_LOCK_TIME
      });
      return {
        success: false,
        statusCode: STATUS_CODES.BAD_REQUEST,
        message:
          "Too many otp requests. Please try again after 1 hour before requesting again."
      };
    }

    await redis.set(otpRequestKey, otpRequestsCount + 1, {
      px: OTP_COOL_DOWN
    });

    return {
      success: true,
      statusCode: STATUS_CODES.CREATED,
      message: "Otp request tracked successfully."
    };
  } catch (error) {
    logger.error(error, "Track Otp Requests error");
    return {
      success: false,
      statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: "Internal server error"
    };
  }
}

export async function sendOtp({
  name,
  email,
  code,
  hashCode,
  subject,
  type
}: SendOtpType): Promise<ApiResponse> {
  try {
    const newOtp = generateOTP(OTP_CODE_LENGTH);

    logger.info(`OTP generated successfully: ${code ? code : newOtp.code}`);

    await sendEmail({
      email,
      subject,
      type,
      data: {
        code: code ? code : newOtp.code,
        name,
        email
      }
    });

    await redis.set(`otp:${email}`, hashCode ? hashCode : newOtp.hashCode, {
      px: OTP_CODE_EXPIRY
    });

    await redis.set(`otp_cooldown:${email}`, OTP_COOL_DOWN, {
      px: OTP_COOL_DOWN
    });

    return {
      success: true,
      statusCode: STATUS_CODES.CREATED,
      message: "Otp sent successfully."
    };
  } catch (error) {
    logger.error(error, "Send Otp error");
    return {
      success: false,
      statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: "Internal server error"
    };
  }
}

export async function verifyOtp(
  email: string,
  hashCode: string
): Promise<ApiResponse> {
  try {
    const hashOtpCodeKey = await redis.get(`otp:${email}`);

    if (!hashOtpCodeKey) {
      return {
        success: false,
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: "Invalid or expired otp"
      };
    }

    const failedAttemptsKey = `otp_attempts:${email}`;
    const failedAttempts = parseInt(
      (await redis.get(failedAttemptsKey)) || "0"
    );

    if (hashOtpCodeKey !== hashCode) {
      if (failedAttempts >= OTP_MAX_ATTEMPTS) {
        await redis.set(`otp_lock:${email}`, "locked", {
          px: OTP_SPAM_LOCK_TIME
        });
        return {
          success: false,
          statusCode: STATUS_CODES.BAD_REQUEST,
          message: "Too many failed attempts. Please try again after 1 hour."
        };
      }
      await redis.set(failedAttemptsKey, failedAttempts + 1, {
        px: OTP_CODE_EXPIRY
      });
      return {
        success: false,
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: `Incorrect OTP. ${OTP_MAX_ATTEMPTS - failedAttempts} attempts left.`
      };
    }

    await redis.del(`otp:${email}`, failedAttemptsKey);

    return {
      success: true,
      statusCode: STATUS_CODES.OK,
      message: "Otp verified successfully."
    };
  } catch (error) {
    logger.error(error, "Verify Otp error");
    return {
      success: false,
      statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: "Internal server error"
    };
  }
}
