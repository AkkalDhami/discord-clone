import dbConnect from "@/configs/db";
import { STATUS_CODES } from "@/constants/status-codes";
import { currentAuthUser } from "@/helpers/auth.helper";
import FriendRequest from "@/models/friend-request.model";
import { ApiResponse } from "@/utils/api-response";
import { AsyncHandler } from "@/utils/async-handler";
import { validateObjectId } from "@/utils/validate-objid";
import { NextRequest } from "next/server";

export const GET = AsyncHandler(async (req: NextRequest) => {
  await dbConnect();

  const currentUser = await currentAuthUser();
  if (!currentUser) {
    return ApiResponse({
      statusCode: STATUS_CODES.UNAUTHORIZED,
      message: "Unauthorized",
      success: false
    });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";

  const searchMatch = q
    ? {
        $or: [
          { username: { $regex: q, $options: "i" } },
          { name: { $regex: q, $options: "i" } },
          { email: { $regex: q, $options: "i" } }
        ]
      }
    : {};

  const [incoming, outgoing] = await Promise.all([
    FriendRequest.find({
      receiver: currentUser.id,
      status: "pending"
    })
      .populate({
        path: "sender",
        match: searchMatch,
        select: "username name email _id avatar"
      })
      .sort({ createdAt: -1 })
      .lean(),

    FriendRequest.find({
      sender: currentUser.id
    })
      .populate({
        path: "receiver",
        match: searchMatch,
        select: "username name email _id avatar"
      })
      .sort({ createdAt: -1 })
      .lean()
  ]);

  return ApiResponse({
    statusCode: STATUS_CODES.OK,
    message: "Success",
    success: true,
    data: {
      incoming,
      outgoing
    }
  });
});

export const DELETE = AsyncHandler(async (req: NextRequest) => {
  await dbConnect();

  const currentUser = await currentAuthUser();
  if (!currentUser) {
    return Response.json({ success: false }, { status: 401 });
  }

  const { requestId }: { requestId: string } = await req.json();

  if (!validateObjectId(requestId)) {
    return ApiResponse({
      statusCode: STATUS_CODES.BAD_REQUEST,
      message: "Invalid friend Id",
      success: false
    });
  }

  const friendReq = await FriendRequest.findById(requestId);

  if (!friendReq) {
    return ApiResponse({
      statusCode: STATUS_CODES.BAD_REQUEST,
      message: "Friend Request not found",
      success: false
    });
  }

  if (friendReq.status !== "pending") {
    return ApiResponse({
      statusCode: STATUS_CODES.BAD_REQUEST,
      message: "Friend request is no longer pending.",
      success: false
    });
  }

  if (friendReq.sender.toString() !== currentUser.id) {
    return ApiResponse({
      statusCode: STATUS_CODES.FORBIDDEN,
      message:
        "You are not authorized to perform this action on this friend request.",
      success: false
    });
  }

  await FriendRequest.deleteOne({
    _id: friendReq._id
  });

  return ApiResponse({
    statusCode: STATUS_CODES.OK,
    message: "Friend request cancelled",
    success: true
  });
});
