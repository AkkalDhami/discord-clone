import dbConnect from "@/configs/db";
import { STATUS_CODES } from "@/constants/status-codes";
import { currentAuthUser } from "@/helpers/auth.helper";
import FriendRequest from "@/models/friend-request.model";
import Friendship from "@/models/friendship.model";
import { ApiResponse } from "@/utils/api-response";
import { AsyncHandler } from "@/utils/async-handler";
import { validateObjectId } from "@/utils/validate-objid";
import mongoose from "mongoose";
import { NextRequest } from "next/server";

export const PUT = AsyncHandler(async (req: NextRequest) => {
  await dbConnect();

  const session = await mongoose.startSession();

  const currentUser = await currentAuthUser();
  if (!currentUser) {
    return ApiResponse({
      statusCode: STATUS_CODES.UNAUTHORIZED,
      message: "Unauthorized",
      success: false
    });
  }

  const { requestId }: { requestId: string } = await req.json();
  if (!validateObjectId(requestId)) {
    return ApiResponse({
      statusCode: STATUS_CODES.BAD_REQUEST,
      message: "Invalid receiverId",
      success: false
    });
  }

  try {
    session.startTransaction();
    const request = await FriendRequest.findOne({
      _id: requestId,
      receiver: currentUser.id
    }).session(session);

    if (!request || request.status !== "pending") {
      await session.abortTransaction();
      return ApiResponse({
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: "Invalid friend request",
        success: false
      });
    }

    if (request.receiver.toString() !== currentUser.id) {
      await session.abortTransaction();
      return ApiResponse({
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: "You are not allowed to accept this friend request",
        success: false
      });
    }

    request.status = "accepted";
    await request.save({ session });

    await Friendship.create(
      [
        { user: request.sender, friend: request.receiver },
        { user: request.receiver, friend: request.sender }
      ],
      { session, ordered: true }
    );

    await session.commitTransaction();
    session.endSession();

    return ApiResponse({
      statusCode: STATUS_CODES.OK,
      message: "Friend request accepted",
      success: true
    });
  } catch (e) {
    console.error({ e });
    await session.abortTransaction();
    session.endSession();
    return ApiResponse({
      statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
      success: false
    });
  }
});
