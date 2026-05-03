import { STATUS_CODES } from "@/constants/status-codes";
import { currentAuthUser } from "@/helpers/auth.helper";
import { validateRequest } from "@/lib/validation";
import Message from "@/models/message.model";
import { ApiResponse } from "@/utils/api-response";
import { AsyncHandler } from "@/utils/async-handler";
import { validateObjectId } from "@/utils/validate-objid";
import { UpdateMessageSchema, UpdateMessageType } from "@/validators/message";
import { NextRequest } from "next/server";
import { Types } from "mongoose";

export const PATCH = AsyncHandler(
  async (
    req: NextRequest,
    { params }: { params: Promise<{ messageId: string }> }
  ) => {
    const { messageId } = await params;
    const user = await currentAuthUser();

    if (!user) {
      return ApiResponse({
        statusCode: STATUS_CODES.UNAUTHORIZED,
        message: "Unauthorized",
        success: false
      });
    }

    if (!validateObjectId(messageId)) {
      return ApiResponse({
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: "Invalid message ID",
        success: false
      });
    }

    const body: UpdateMessageType = await req.json();

    const result = validateRequest(UpdateMessageSchema, body);

    if (!result.success) {
      return ApiResponse({
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: "Invalid request body",
        success: false
      });
    }

    const { content, pinned, reaction } = result.data;

    const message = await Message.findById(messageId);

    if (!message) {
      return ApiResponse({
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: "Invalid message",
        success: false
      });
    }

    if (!message.sender.equals(user.id) && pinned === undefined && !reaction) {
      return ApiResponse({
        statusCode: STATUS_CODES.FORBIDDEN,
        message: `You are not authorized to edit this message`,
        success: false
      });
    }

    if (content) {
      if (!message.sender.equals(user.id)) {
        return ApiResponse({
          statusCode: STATUS_CODES.FORBIDDEN,
          message: `You are not authorized to edit this message`,
          success: false
        });
      }
      message.content = content;
      message.edited = true;
    }

    if (typeof pinned !== "undefined") {
      if (message.visibleTo.length > 1) {
        return ApiResponse({
          statusCode: STATUS_CODES.BAD_REQUEST,
          message: `Secret messages cannot be pinned`,
          success: false
        });
      }

      message.pinned = pinned;
    }

    if (reaction) {
      message.reactions = message.reactions ?? [];
      const existingReaction = message.reactions.find(
        r => r.emoji === reaction
      );

      if (existingReaction) {
        const alreadyReacted = existingReaction.reactedByUserIds.some(
          id => `${id}` === user.id
        );

        if (alreadyReacted) {
          existingReaction.reactedByUserIds =
            existingReaction.reactedByUserIds.filter(id => `${id}` !== user.id);
        } else {
          existingReaction.reactedByUserIds.push(new Types.ObjectId(user.id));
        }

        if (existingReaction.reactedByUserIds.length === 0) {
          message.reactions = message.reactions.filter(
            r => r.emoji !== reaction
          );
        }
      } else {
        message.reactions.push({
          emoji: reaction,
          reactedByUserIds: [new Types.ObjectId(user.id)]
        });
      }
    }

    await message.save();

    return ApiResponse({
      statusCode: STATUS_CODES.OK,
      message: `Message ${
        typeof pinned === "boolean"
          ? pinned
            ? "pinned"
            : "unpinned"
          : "updated"
      } successfully`,
      success: true,
      data: message
    });
  }
);

export const DELETE = AsyncHandler(
  async (
    _req: NextRequest,
    { params }: { params: Promise<{ messageId: string }> }
  ) => {
    const { messageId } = await params;
    const user = await currentAuthUser();

    if (!user) {
      return ApiResponse({
        statusCode: STATUS_CODES.UNAUTHORIZED,
        message: "Unauthorized",
        success: false
      });
    }

    if (!validateObjectId(messageId)) {
      return ApiResponse({
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: "Invalid message ID",
        success: false
      });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return ApiResponse({
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: "Message not found!",
        success: false
      });
    }

    if (!message.sender.equals(user.id)) {
      return ApiResponse({
        statusCode: STATUS_CODES.FORBIDDEN,
        message: "You are not authorized to delete this message",
        success: false
      });
    }

    await Message.deleteOne({ _id: messageId });

    return ApiResponse({
      statusCode: STATUS_CODES.OK,
      message: `Message deleted successfully`,
      success: true,
      data: message
    });
  }
);
