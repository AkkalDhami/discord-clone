import dbConnect from "@/configs/db";
import { STATUS_CODES } from "@/constants/status-codes";
import { currentAuthUser } from "@/helpers/auth.helper";
import FriendRequest from "@/models/friend-request.model";
import { ApiResponse } from "@/utils/api-response";
import { AsyncHandler } from "@/utils/async-handler";
import { validateObjectId } from "@/utils/validate-objid";
import { UpdateFriendRequestStatusType } from "@/validators/friends";
import { NextRequest } from "next/server";

export const PUT = AsyncHandler(async (req: NextRequest) => {
  await dbConnect();

  const currentUser = await currentAuthUser();
  if (!currentUser) {
    return ApiResponse({
      statusCode: STATUS_CODES.UNAUTHORIZED,
      message: "Unauthorized",
      success: false
    });
  }

  const body: UpdateFriendRequestStatusType = await req.json();

  const { requestId: friendRequestId } = body;

  if (!validateObjectId(friendRequestId)) {
    return ApiResponse({
      statusCode: STATUS_CODES.BAD_REQUEST,
      message: "Invalid friend request id",
      success: false
    });
  }

  const dbFriendReq = await FriendRequest.findOne({
    _id: friendRequestId
  });

  if (!dbFriendReq) {
    return ApiResponse({
      statusCode: STATUS_CODES.BAD_REQUEST,
      message: "Friend request not found",
      success: false
    });
  }

  if (dbFriendReq.status === "ignored") {
    return ApiResponse({
      statusCode: STATUS_CODES.BAD_REQUEST,
      message: "Friend request already ignored",
      success: false
    });
  }

  if (dbFriendReq.receiver.toString() !== currentUser.id) {
    return ApiResponse({
      statusCode: STATUS_CODES.FORBIDDEN,
      message:
        "You are not authorized to perform this action on this friend request",
      success: false
    });
  }

  const friendRequest = await FriendRequest.updateOne(
    {
      _id: friendRequestId
    },

    {
      $set: {
        status: "ignored"
      }
    }
  );

  if (!friendRequest) {
    return ApiResponse({
      statusCode: STATUS_CODES.BAD_REQUEST,
      message: `Failed to ignore friend request`,
      success: false
    });
  }

  return ApiResponse({
    statusCode: STATUS_CODES.OK,
    message: `Friend request ignored successfully`,
    success: true
  });
});
