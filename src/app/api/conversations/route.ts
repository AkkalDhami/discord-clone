import { STATUS_CODES } from "@/constants/status-codes";
import { currentAuthUser } from "@/helpers/auth.helper";
import { validateRequest } from "@/lib/validation";
import Conversation from "@/models/conversation.model";
import { ApiResponse } from "@/utils/api-response";
import { AsyncHandler } from "@/utils/async-handler";
import { validateObjectId } from "@/utils/validate-objid";
import {
  ConversationSchema,
  ConversationUpdateSchema
} from "@/validators/conversation";
import { Types } from "mongoose";
import { NextRequest } from "next/server";

export const PATCH = AsyncHandler(async (req: NextRequest) => {
  const body = await req.json();
  const user = await currentAuthUser();

  if (!user) {
    return ApiResponse({
      statusCode: STATUS_CODES.UNAUTHORIZED,
      message: "Unauthorized",
      success: false
    });
  }

  const validationResult = validateRequest(ConversationUpdateSchema, body);

  if (!validationResult.success) {
    return ApiResponse({
      statusCode: STATUS_CODES.BAD_REQUEST,
      message: "Invalid request body",
      success: false
    });
  }

  const { conversationId, name } = validationResult.data;

  if (!validateObjectId(conversationId)) {
    return ApiResponse({
      statusCode: STATUS_CODES.BAD_REQUEST,
      message: "Invalid conversation id",
      success: false
    });
  }

  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    return ApiResponse({
      statusCode: STATUS_CODES.NOT_FOUND,
      message: "Conversation not found",
      success: false
    });
  }

  if (conversation.type !== "group") {
    return ApiResponse({
      statusCode: STATUS_CODES.BAD_REQUEST,
      message: "Only group conversations can be edited",
      success: false
    });
  }

  const isParticipant = conversation.participants.some(
    participant => participant.toString() === user.id
  );

  if (!isParticipant) {
    return ApiResponse({
      statusCode: STATUS_CODES.UNAUTHORIZED,
      message: "You are not authorized to edit this group",
      success: false
    });
  }

  const updatedConversation = await Conversation.findByIdAndUpdate(
    conversationId,
    {
      name
    }
  );

  return ApiResponse({
    statusCode: STATUS_CODES.OK,
    success: true,
    data: updatedConversation,
    message: "Group updated successfully"
  });
});

export const POST = AsyncHandler(async (req: NextRequest) => {
  const body = await req.json();
  const user = await currentAuthUser();

  if (!user) {
    return ApiResponse({
      statusCode: STATUS_CODES.UNAUTHORIZED,
      message: "Unauthorized",
      success: false
    });
  }

  const validationResult = validateRequest(ConversationSchema, body);

  if (!validationResult.success) {
    return ApiResponse({
      statusCode: STATUS_CODES.BAD_REQUEST,
      message: "Invalid request body",
      success: false
    });
  }

  const { name, type, participants } = validationResult.data;

  const mappedIds = [...participants, user.id]
    .map(id => new Types.ObjectId(id))
    .sort((a, b) => a.toString().localeCompare(b.toString()));

  const participantsKey = mappedIds.join("_");

  const existingConversation = await Conversation.findOne({
    participantsKey,
    type
  });

  if (existingConversation) {
    return ApiResponse({
      statusCode: STATUS_CODES.OK,
      success: true,
      data: existingConversation,
      message: "Conversation already exists"
    });
  }

  const conversation = await Conversation.create({
    participants: [...participants, user.id],
    type,
    admin: user.id,
    name,
    participantsKey
  });

  return ApiResponse({
    statusCode: STATUS_CODES.OK,
    success: true,
    data: conversation,
    message: "Conversation created successfully"
  });
});
