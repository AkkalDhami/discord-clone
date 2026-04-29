import { NextRequest } from "next/server";

import Message from "@/models/message.model";
import Conversation from "@/models/conversation.model";
import { STATUS_CODES } from "@/constants/status-codes";
import { AsyncHandler } from "@/utils/async-handler";
import { currentAuthUser } from "@/helpers/auth.helper";
import { ApiResponse } from "@/utils/api-response";
import { validateRequest } from "@/lib/validation";
import { CreateMessageSchema } from "@/validators/message";
import { validateObjectId } from "@/utils/validate-objid";
import { Types } from "mongoose";

export const POST = AsyncHandler(async (req: NextRequest) => {
  const body = await req.json();
  const user = await currentAuthUser();

  if (!user) {
    return ApiResponse({
      statusCode: STATUS_CODES.UNAUTHORIZED,
      success: false,
      message: "Unauthorized"
    });
  }

  const validationResult = validateRequest(CreateMessageSchema, body);

  if (!validationResult.success) {
    return ApiResponse({
      statusCode: STATUS_CODES.BAD_REQUEST,
      success: false,
      message: "Invalid request body"
    });
  }

  const { content, conversationId, privateUsers } = validationResult.data;

  if (!conversationId) {
    return ApiResponse({
      statusCode: STATUS_CODES.BAD_REQUEST,
      success: false,
      message: "conversationId is required"
    });
  }

  if (!validateObjectId(conversationId)) {
    return ApiResponse({
      statusCode: STATUS_CODES.BAD_REQUEST,
      success: false,
      message: "Invalid conversation Id"
    });
  }

  const message = await Message.create({
    sender: user.id,
    conversation: conversationId,
    content,
    visibleTo: privateUsers?.length ? [user.id, ...privateUsers] : []
  });

  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: message._id,
    updatedAt: new Date()
  });

  return ApiResponse({
    statusCode: STATUS_CODES.OK,
    success: true,
    data: message,
    message: "Message sent successfully"
  });
});

export const GET = AsyncHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);

  const conversationId = searchParams.get("conversationId") as string;
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const cursor = searchParams.get("cursor");

  if (!validateObjectId(conversationId)) {
    return ApiResponse({
      statusCode: STATUS_CODES.BAD_REQUEST,
      success: false,
      message: "Invalid conversation Id"
    });
  }

  const user = await currentAuthUser();
  if (!user) {
    return ApiResponse({
      statusCode: STATUS_CODES.UNAUTHORIZED,
      success: false,
      message: "Unauthorized"
    });
  }

  const matchQuery: {
    conversation: Types.ObjectId;
    _id?: { $lt: Types.ObjectId };
  } = {
    conversation: new Types.ObjectId(conversationId)
  };

  if (cursor && validateObjectId(cursor)) {
    matchQuery._id = { $lt: new Types.ObjectId(cursor) };
  }

  const messages = await Message.aggregate([
    {
      $match: {
        ...matchQuery,
        $expr: {
          $or: [
            { $eq: [{ $size: { $ifNull: ["$visibleTo", []] } }, 0] },
            {
              $in: [
                new Types.ObjectId(user.id),
                { $ifNull: ["$visibleTo", []] }
              ]
            }
          ]
        }
      }
    },
    {
      $sort: {
        _id: -1
      }
    },
    {
      $limit: limit
    },
    {
      $lookup: {
        from: "profiles",
        localField: "sender",
        foreignField: "_id",
        as: "sender",
        pipeline: [
          {
            $project: {
              _id: 1,
              name: 1,
              username: 1,
              email: 1,
              avatar: 1,
              createdAt: 1
            }
          }
        ]
      }
    },

    { $unwind: "$sender" }
  ]);

  const hasMore = messages.length === limit;
  const nextCursor = hasMore ? messages[messages.length - 1]._id : null;

  return ApiResponse({
    statusCode: STATUS_CODES.OK,
    success: true,
    message: "Get messages",
    data: {
      messages,
      hasMore,
      nextCursor
    }
  });
});
