import { validateRequest } from "@/lib/validation";
import dbConnect from "@/configs/db";
import { STATUS_CODES } from "@/constants/status-codes";
import { currentAuthUser } from "@/helpers/auth.helper";
import FriendRequest from "@/models/friend-request.model";
import Conversation from "@/models/conversation.model";
import Friendship from "@/models/friendship.model";
import Message from "@/models/message.model";
import Profile from "@/models/profile.model";
import { ApiResponse } from "@/utils/api-response";
import { AsyncHandler } from "@/utils/async-handler";
import { validateObjectId } from "@/utils/validate-objid";
import {
  UpdateFriendStatus,
  UpdateFriendStatusType
} from "@/validators/friends";
import { NextRequest } from "next/server";

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

export const DELETE = AsyncHandler(async (req: NextRequest) => {
  await dbConnect();
  const currentUser = await currentAuthUser();
  if (!currentUser) {
    return ApiResponse({
      statusCode: STATUS_CODES.UNAUTHORIZED,
      message: "Unauthorized",
      success: false
    });
  }

  const { friendId }: { friendId: string } = await req.json();

  if (!validateObjectId(friendId)) {
    return ApiResponse({
      statusCode: STATUS_CODES.BAD_REQUEST,
      message: "Invalid friend Id",
      success: false
    });
  }

  const friend = await Profile.findOne({
    _id: friendId
  });

  if (!friend) {
    return ApiResponse({
      statusCode: STATUS_CODES.BAD_REQUEST,
      message: "Friend not found",
      success: false
    });
  }

  const directConversations = await Conversation.find({
    type: "direct",
    participants: {
      $all: [currentUser.id, friendId]
    }
  }).select("_id");

  const conversationIds = directConversations.map(
    conversation => conversation._id
  );

  await Promise.all([
    Friendship.deleteOne({
      friend: friendId,
      user: currentUser.id
    }),

    Friendship.deleteOne({
      friend: currentUser.id,
      user: friendId
    }),

    FriendRequest.deleteOne({
      $or: [
        { sender: currentUser.id, receiver: friend._id },
        { sender: friend._id, receiver: currentUser.id }
      ]
    }),

    conversationIds.length > 0
      ? Message.deleteMany({ conversationId: { $in: conversationIds } })
      : Promise.resolve(),

    conversationIds.length > 0
      ? Conversation.deleteMany({ _id: { $in: conversationIds } })
      : Promise.resolve()
  ]);

  return ApiResponse({
    statusCode: STATUS_CODES.OK,
    message: "Friend removed successfully",
    success: true
  });
});

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

  const body: UpdateFriendStatusType = await req.json();

  const result = validateRequest(UpdateFriendStatus, body);

  if (!result.success) {
    return ApiResponse({
      statusCode: STATUS_CODES.BAD_REQUEST,
      message: "Invalid request data",
      success: false
    });
  }

  const { type, friendId } = result.data;

  if (!validateObjectId(friendId)) {
    return ApiResponse({
      statusCode: STATUS_CODES.BAD_REQUEST,
      message: "Invalid friend ID",
      success: false
    });
  }

  const friend = await Profile.findById(friendId);
  if (!friend) {
    return ApiResponse({
      statusCode: STATUS_CODES.NOT_FOUND,
      message: "User not found",
      success: false
    });
  }

  const friendship = await Friendship.findOne({
    friend: friendId,
    user: currentUser.id
  });

  if (!friendship) {
    return ApiResponse({
      statusCode: STATUS_CODES.NOT_FOUND,
      message: "Friendship not found",
      success: false
    });
  }

  if (
    type === "unblock" &&
    currentUser.id !== friendship.blockedBy?.toString()
  ) {
    return ApiResponse({
      statusCode: STATUS_CODES.FORBIDDEN,
      message: "You are not allowed to perform this action.",
      success: false
    });
  }

  if (type === "block" && friendship.blockedBy?.toString() === currentUser.id) {
    return ApiResponse({
      statusCode: STATUS_CODES.BAD_REQUEST,
      message: "User is already blocked.",
      success: false
    });
  }

  const update = {
    status: type === "block" ? "blocked" : "active",
    blockedBy: type === "block" ? currentUser.id : null
  };

  await Promise.all([
    Friendship.findOneAndUpdate(
      { friend: friendId, user: currentUser.id },
      { $set: update }
    ),
    Friendship.findOneAndUpdate(
      { friend: currentUser.id, user: friendId },
      { $set: update }
    )
  ]);

  return ApiResponse({
    statusCode: STATUS_CODES.OK,
    message:
      type === "block"
        ? "User has been added to your block list."
        : "User has been removed from your block list.",
    success: true
  });
});
