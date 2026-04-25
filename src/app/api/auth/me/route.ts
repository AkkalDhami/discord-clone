import { STATUS_CODES } from "@/constants/status-codes";
import { currentAuthUser } from "@/helpers/auth.helper";
import { ApiResponse } from "@/utils/api-response";
import { AsyncHandler } from "@/utils/async-handler";

export const GET = AsyncHandler(async () => {
  const user = await currentAuthUser();

  if (!user) {
    return ApiResponse({
      statusCode: STATUS_CODES.UNAUTHORIZED,
      message: "Unauthorized",
      success: false
    });
  }

  return ApiResponse({
    success: true,
    statusCode: STATUS_CODES.OK,
    message: `User profile fetched successfully`,
    data: { user }
  });
});
