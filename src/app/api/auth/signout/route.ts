import { STATUS_CODES } from "@/constants/status-codes";
import { ApiResponse } from "@/utils/api-response";
import { NextRequest } from "next/server";

import { AsyncHandler } from "@/utils/async-handler";
import { currentAuthUser } from "@/helpers/auth.helper";
import { cookies } from "next/headers";
import { verifyRefreshToken } from "@/lib/jwt";

export const POST = AsyncHandler(async (_req: NextRequest) => {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) {
    return ApiResponse({
      statusCode: STATUS_CODES.UNAUTHORIZED,
      message: "Unauthorized, please login first",
      success: false
    });
  }

  const user = await currentAuthUser();

  if (!user) {
    return ApiResponse({
      statusCode: STATUS_CODES.UNAUTHORIZED,
      message: "Unauthorized, please login first",
      success: false
    });
  }

  const decodedToken = verifyRefreshToken(refreshToken);
  if (!decodedToken) {
    return ApiResponse({
      statusCode: STATUS_CODES.UNAUTHORIZED,
      message: "Unauthorized, please login first",
      success: false
    });
  }

  cookieStore.delete("refreshToken");
  cookieStore.delete("accessToken");

  return ApiResponse({
    success: true,
    statusCode: STATUS_CODES.OK,
    message: "User signed out successfully"
  });
});
