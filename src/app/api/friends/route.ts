import dbConnect from "@/configs/db";
import { STATUS_CODES } from "@/constants/status-codes";
import { currentAuthUser } from "@/helpers/auth.helper";
import Friendship from "@/models/friendship.model";
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

  const friends = await Friendship.find({
    user: currentUser.id
  })
    .populate("friend", "username name email _id avatar")
    .lean();

  return ApiResponse({
    statusCode: STATUS_CODES.OK,
    message: "Success",
    success: true,
    data: friends
  });
});
