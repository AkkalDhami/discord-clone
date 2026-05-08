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

  const { content, conversationId, privateUsers, replyTo, forwarded } =
    validationResult.data;

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

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    return ApiResponse({
      statusCode: STATUS_CODES.NOT_FOUND,
      success: false,
      message: "Conversation not found"
    });
  }

  const isParticipant = conversation.participants.includes(
    new Types.ObjectId(user?.id)
  );
  if (!isParticipant) {
    return ApiResponse({
      statusCode: STATUS_CODES.FORBIDDEN,
      success: false,
      message: "You are not a participant of this conversation"
    });
  }

  const message = await Message.create({
    sender: user.id,
    conversation: conversationId,
    content,
    visibleTo: privateUsers?.length ? [user.id, ...privateUsers] : [],
    replyTo,
    forwarded
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
  const onlyPinned = searchParams.get("pinned") === "true";

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
        ...(onlyPinned && { pinned: true }),
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
      $sort: onlyPinned ? { updatedAt: -1, _id: -1 } : { _id: -1 }
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
    {
      $lookup: {
        from: "profiles",
        localField: "visibleTo",
        foreignField: "_id",
        as: "visibleTo",
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

    {
      $lookup: {
        from: "messages",
        localField: "replyTo",
        foreignField: "_id",
        as: "replyTo",
        pipeline: [
          {
            $project: {
              _id: 1,
              content: 1,
              sender: 1,
              visibleTo: 1,
              createdAt: 1
            }
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
                    avatar: 1
                  }
                }
              ]
            }
          },
          { $unwind: "$sender" }
        ]
      }
    },
    {
      $unwind: {
        path: "$replyTo",
        preserveNullAndEmptyArrays: true
      }
    },

    { $unwind: "$sender" }
  ]);

  const hasMore = messages.length === limit;
  const nextCursor = hasMore ? messages[messages.length - 1]._id : undefined;

  const reversedMessages = messages.reverse();

  return ApiResponse({
    statusCode: STATUS_CODES.OK,
    success: true,
    message: onlyPinned ? "Get pinned messages" : "Get messages",
    data: {
      messages: reversedMessages,
      hasMore,
      nextCursor
    }
  });
});
