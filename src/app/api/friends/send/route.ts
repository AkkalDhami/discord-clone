import dbConnect from "@/configs/db";
import { STATUS_CODES } from "@/constants/status-codes";
import { currentAuthUser } from "@/helpers/auth.helper";
import { validateRequest } from "@/lib/validation";
import FriendRequest from "@/models/friend-request.model";
import Friendship from "@/models/friendship.model";
import Profile from "@/models/profile.model";
import { ApiResponse } from "@/utils/api-response";
import { AsyncHandler } from "@/utils/async-handler";
import { generatePairKey } from "@/utils/pair";
import { SendFriendRequestSchema } from "@/validators/friends";
import { NextRequest } from "next/server";

export const POST = AsyncHandler(async (req: NextRequest) => {
  await dbConnect();

  const currentUser = await currentAuthUser();
  if (!currentUser) {
    return ApiResponse({
      statusCode: STATUS_CODES.UNAUTHORIZED,
      message: "Unauthorized",
      success: false
    });
  }

  const body = await req.json();

  const result = validateRequest(SendFriendRequestSchema, body);
  if (!result.success) {
    return ApiResponse({
      statusCode: STATUS_CODES.BAD_REQUEST,
      message: "Invalid request data",
      success: false
    });
  }

  const { receiverUsername } = result.data;

  if (!receiverUsername) {
    return ApiResponse({
      statusCode: STATUS_CODES.BAD_REQUEST,
      message: "Receiver username is required",
      success: false
    });
  }

  const receiver = await Profile.findOne({
    username: receiverUsername
  });

  if (!receiver) {
    return ApiResponse({
      statusCode: STATUS_CODES.BAD_REQUEST,
      message: "User with this username not found",
      success: false
    });
  }

  if (currentUser.id === receiver._id.toString()) {
    return ApiResponse({
      statusCode: STATUS_CODES.BAD_REQUEST,
      message: "Cannot send request to yourself",
      success: false
    });
  }

  const existingFriend = await Friendship.findOne({
    user: currentUser.id,
    friend: receiver._id
  });

  if (existingFriend) {
    return ApiResponse({
      statusCode: STATUS_CODES.BAD_REQUEST,
      message: "You are already friends",
      success: false
    });
  }

  const pairKey = generatePairKey(currentUser.id, receiver._id.toString());

  const existingRequest = await FriendRequest.findOne({
    pairKey
  });

  if (existingRequest) {
    return ApiResponse({
      statusCode: STATUS_CODES.BAD_REQUEST,
      message: "You already sent request to this user",
      success: false
    });
  }

  const friendRequest = new FriendRequest({
    sender: currentUser.id,
    pairKey,
    receiver: receiver._id
  });

  await friendRequest.save();

  return ApiResponse({
    statusCode: STATUS_CODES.OK,
    message: "Friend request sent",
    success: true,
    data: friendRequest
  });
});
