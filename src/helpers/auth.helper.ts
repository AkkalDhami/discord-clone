import { cookies } from "next/headers";
import crypto from "crypto";
import argon2 from "argon2";
import {
  ACCESS_TOKEN_EXPIRY,
  RATE_LIMIT_MAX_REQUESTS,
  RATE_LIMIT_WINDOW,
  REFRESH_TOKEN_EXPIRY
} from "@/constants/auth-constants";
import { NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/jwt";
import dbConnect from "@/configs/db";
import Profile from "@/models/profile.model";
import { logger } from "@/utils/logger";

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/"
} as const;

export const hashPassword = async (password: string) => argon2.hash(password);

export const verifyPassword = async (
  password: string,
  hashedPassword: string
) => argon2.verify(hashedPassword, password);


export const setAuthCookies = async (
  accessToken: string,
  refreshToken: string
) => {
  const cookieStore = await cookies();
  cookieStore.set("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: ACCESS_TOKEN_EXPIRY
  });
  cookieStore.set("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: REFRESH_TOKEN_EXPIRY
  });
};

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

export function checkRateLimit(clientIP: string) {
  const now = Date.now();
  const data = rateLimitStore.get(clientIP);

  if (!data || now > data.resetTime) {
    rateLimitStore.set(clientIP, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
  }

  if (data.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  data.count++;
  rateLimitStore.set(clientIP, data);

  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - data.count };
}

export function resetRateLimit(clientIP: string) {
  rateLimitStore.delete(clientIP);
}

export const currentAuthUser = async () => {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    if (!accessToken) return null;

    const decodedAccessToken = verifyAccessToken(accessToken);

    if (!decodedAccessToken?.sub) return null;

    const { sub: userId } = decodedAccessToken;

    await dbConnect();

    const user = await Profile.findOne({ _id: userId });

    if (!user) return null;

    const userData = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return userData;
  } catch (error) {
    logger.error(error);
    return null;
  }
};

export const generateRandomToken = (id: string) => {
  const token = crypto.createHash("sha256").update(String(id)).digest("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(String(token))
    .digest("hex");

  return { token, hashedToken };
};

export const generateUniqueUsername = async (
  email: string
): Promise<string> => {
  const username = email.split("@")[0];
  const user = await Profile.findOne({ username });
  if (user) {
    return generateUniqueUsername(email + Math.floor(Math.random() * 100));
  }
  return username;
};

export const createProfile = async ({
  name,
  email,
  avatar,
  provider,
  providerAccountId,
  isEmailVerified
}: {
  name: string;
  email: string;
  avatar?: string;
  provider: string;
  providerAccountId: string;
  isEmailVerified: boolean;
}) => {
  try {
    await dbConnect();
    const user = await Profile.create({
      email,
      name,
      avatar: {
        url: avatar
      },
      username: await generateUniqueUsername(email),
      providerAccountId,
      provider,
      isEmailVerified
    });

    return user;
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    }
    return null;
  }
};
