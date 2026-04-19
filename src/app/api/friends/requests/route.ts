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

  const { requestId: friendRequestId, type } = body;

  if (!validateObjectId(friendRequestId)) {
    return ApiResponse({
      statusCode: STATUS_CODES.BAD_REQUEST,
      message: "Invalid friend request id",
      success: false
    });
  }

  if (!type) {
    return ApiResponse({
      statusCode: STATUS_CODES.BAD_REQUEST,
      message: "Invalid friend request",
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

  if (dbFriendReq.status === "rejected") {
    return ApiResponse({
      statusCode: STATUS_CODES.BAD_REQUEST,
      message: "Friend request already rejected",
      success: false
    });
  }

  if (dbFriendReq.status === "blocked" && type !== "unblock") {
    return ApiResponse({
      statusCode: STATUS_CODES.BAD_REQUEST,
      message: "Friend request already blocked",
      success: false
    });
  }

  if (dbFriendReq.status === "blocked" && type !== "unblock") {
    return ApiResponse({
      statusCode: STATUS_CODES.BAD_REQUEST,
      message: "Friend request already blocked",
      success: false
    });
  }

  const friendRequest = await FriendRequest.updateOne(
    {
      _id: friendRequestId
    },

    {
      $set: {
        status:
          type === "reject"
            ? "rejected"
            : type === "block"
              ? "blocked"
              : "pending"
      }
    }
  );

  if (!friendRequest) {
    return ApiResponse({
      statusCode: STATUS_CODES.BAD_REQUEST,
      message: `Failed to ${type === "reject" ? "reject" : "block"} friend request`,
      success: false
    });
  }

  return ApiResponse({
    statusCode: STATUS_CODES.OK,
    message: `Friend request ${
      type === "reject" ? "rejected" : type === "block" ? "blocked" : "unblocked"
    } successfully`,
    success: true
  });
});
