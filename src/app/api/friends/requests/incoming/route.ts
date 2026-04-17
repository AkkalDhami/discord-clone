import dbConnect from "@/configs/db";
import { STATUS_CODES } from "@/constants/status-codes";
import { currentAuthUser } from "@/helpers/auth.helper";
import FriendRequest from "@/models/friend-request.model";
import { ApiResponse } from "@/utils/api-response";
import { AsyncHandler } from "@/utils/async-handler";

export const GET = AsyncHandler(async () => {
  await dbConnect();

  const currentUser = await currentAuthUser();
  if (!currentUser) {
    return ApiResponse({
      statusCode: STATUS_CODES.UNAUTHORIZED,
      message: "Unauthorized",
      success: false
    });
  }

  const requests = await FriendRequest.find({
    receiver: currentUser.id,
    status: "pending"
  })
    .populate("sender", "username name email _id avatar")
    .sort({ createdAt: -1 })
    .lean();

  return ApiResponse({
    statusCode: STATUS_CODES.OK,
    message: "Success",
    success: true,
    data: requests
  });
});
