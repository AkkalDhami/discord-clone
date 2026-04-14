import { STATUS_CODES } from "@/constants/status-codes";
import { setAuthCookies } from "@/helpers/auth.helper";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} from "@/lib/jwt";
import Profile from "@/models/profile.model";
import { ApiResponse } from "@/utils/api-response";
import { AsyncHandler } from "@/utils/async-handler";
import { cookies } from "next/headers";

export const POST = AsyncHandler(async () => {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) {
    return ApiResponse({
      success: false,
      statusCode: STATUS_CODES.UNAUTHORIZED,
      message: "Unauthorized, please login first"
    });
  }

  const decoded = verifyRefreshToken(refreshToken);

  if (!decoded.sub) {
    return ApiResponse({
      success: false,
      statusCode: STATUS_CODES.UNAUTHORIZED,
      message: "Unauthorized, please login first"
    });
  }

  const user = await Profile.findOne({ _id: decoded.sub });
  if (!user) {
    return ApiResponse({
      success: false,
      statusCode: STATUS_CODES.UNAUTHORIZED,
      message: "Unauthorized, please login first"
    });
  }

  const newAccessToken = signAccessToken({
    sub: user._id.toString(),
    email: user.email
  });

  const newRefreshToken = signRefreshToken({
    sub: user._id.toString()
  });

  await setAuthCookies(newAccessToken, newRefreshToken);

  return ApiResponse({
    success: true,
    statusCode: STATUS_CODES.OK,
    message: "Refreshing tokens successfully"
  });
});
