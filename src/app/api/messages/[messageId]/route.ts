import { STATUS_CODES } from "@/constants/status-codes";
import { currentAuthUser } from "@/helpers/auth.helper";
import { validateRequest } from "@/lib/validation";
import Message from "@/models/message.model";
import { ApiResponse } from "@/utils/api-response";
import { AsyncHandler } from "@/utils/async-handler";
import { validateObjectId } from "@/utils/validate-objid";
import { UpdateMessageSchema, UpdateMessageType } from "@/validators/message";
import { NextRequest } from "next/server";

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

    const { content, pinned } = result.data;

    const message = await Message.findById(messageId);

    if (!message) {
      return ApiResponse({
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: "Invalid message",
        success: false
      });
    }

    if (!message.sender.equals(user.id) && pinned === undefined) {
      return ApiResponse({
        statusCode: STATUS_CODES.FORBIDDEN,
        message: `You are not authorized to edit this message`,
        success: false
      });
    }

    if (content) {
      message.content = content;
      message.edited = true;
    }

    if (typeof pinned !== "undefined") {
      message.pinned = pinned;
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
