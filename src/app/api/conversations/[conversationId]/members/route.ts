import dbConnect from "@/configs/db";
import { STATUS_CODES } from "@/constants/status-codes";
import { currentAuthUser } from "@/helpers/auth.helper";
import { validateRequest } from "@/lib/validation";
import Conversation from "@/models/conversation.model";
import Message from "@/models/message.model";
import Profile from "@/models/profile.model";
import { ApiResponse } from "@/utils/api-response";
import { AsyncHandler } from "@/utils/async-handler";
import {
  ConversationAddMembersSchema,
  LeaveConversationSchema
} from "@/validators/conversation";
import { validateObjectId } from "@/utils/validate-objid";
import { Types } from "mongoose";
import { NextRequest } from "next/server";

export const PATCH = AsyncHandler(
  async (
    req: NextRequest,
    { params }: { params: Promise<{ conversationId: string }> }
  ) => {
    await dbConnect();

    const { conversationId } = await params;
    const user = await currentAuthUser();

    if (!user) {
      return ApiResponse({
        statusCode: STATUS_CODES.UNAUTHORIZED,
        message: "Unauthorized",
        success: false
      });
    }

    if (!validateObjectId(conversationId)) {
      return ApiResponse({
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: "Invalid conversation id",
        success: false
      });
    }

    const body = await req.json();

    const validationResult = validateRequest(
      ConversationAddMembersSchema.pick({ participants: true }),
      body
    );

    if (!validationResult.success) {
      return ApiResponse({
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: "Invalid request body",
        success: false
      });
    }

    const { participants } = validationResult.data;

    const invalidIds = participants.filter(id => !validateObjectId(id));
    if (invalidIds.length > 0) {
      return ApiResponse({
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: "One or more participant ids are invalid",
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
        message: "Only group conversations can add members",
        success: false
      });
    }

    const isParticipant = conversation.participants.some(
      participant => participant.toString() === user.id
    );

    if (!isParticipant) {
      return ApiResponse({
        statusCode: STATUS_CODES.UNAUTHORIZED,
        message: "You are not authorized to modify this group",
        success: false
      });
    }

    const existingIds = conversation.participants.map(id => id.toString());
    const newIds = participants.filter(
      id => !existingIds.includes(id) && id !== user.id
    );

    if (newIds.length === 0) {
      return ApiResponse({
        statusCode: STATUS_CODES.OK,
        success: true,
        data: conversation,
        message: "No new members were added"
      });
    }

    const validMembers = await Profile.countDocuments({
      _id: { $in: newIds.map(id => new Types.ObjectId(id)) }
    });

    if (validMembers !== newIds.length) {
      return ApiResponse({
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: "One or more selected users are not valid profiles",
        success: false
      });
    }

    const updatedConversation = await Conversation.findByIdAndUpdate(
      conversationId,
      {
        $addToSet: {
          participants: {
            $each: newIds.map(id => new Types.ObjectId(id))
          }
        }
      }
    );

    return ApiResponse({
      statusCode: STATUS_CODES.OK,
      success: true,
      data: updatedConversation,
      message: "Members added successfully"
    });
  }
);

export const PUT = AsyncHandler(
  async (
    req: NextRequest,
    { params }: { params: Promise<{ conversationId: string }> }
  ) => {
    const body = await req.json();
    const user = await currentAuthUser();

    const { conversationId } = await params;

    if (!user) {
      return ApiResponse({
        statusCode: STATUS_CODES.UNAUTHORIZED,
        message: "Unauthorized",
        success: false
      });
    }

    const validationResult = validateRequest(
      LeaveConversationSchema.pick({ participants: true }),
      body
    );

    if (!validationResult.success) {
      return ApiResponse({
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: "Invalid request body",
        success: false
      });
    }

    const { participants } = validationResult.data;

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
        message: "Only group conversations can be left",
        success: false
      });
    }

    const isParticipant = conversation.participants.some(
      participant => participant.toString() === user.id
    );

    if (!isParticipant) {
      return ApiResponse({
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: "You are not a member of this group",
        success: false
      });
    }

    const updatedConversation = await Conversation.findByIdAndUpdate(
      conversationId,
      {
        $pull: {
          participants: { $in: participants.map(id => new Types.ObjectId(id)) }
        }
      }
    );

    return ApiResponse({
      statusCode: STATUS_CODES.OK,
      success: true,
      data: updatedConversation,
      message: "You left the group"
    });
  }
);

export const DELETE = AsyncHandler(
  async (
    req: NextRequest,
    { params }: { params: Promise<{ conversationId: string }> }
  ) => {
    await dbConnect();

    const { conversationId } = await params;
    const user = await currentAuthUser();

    if (!user) {
      return ApiResponse({
        statusCode: STATUS_CODES.UNAUTHORIZED,
        message: "Unauthorized",
        success: false
      });
    }

    if (!validateObjectId(conversationId)) {
      return ApiResponse({
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: "Invalid conversation id",
        success: false
      });
    }

    const body = await req.json();
    const validationResult = validateRequest(
      LeaveConversationSchema.pick({ participants: true }),
      body
    );

    if (!validationResult.success) {
      return ApiResponse({
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: "Invalid request body",
        success: false
      });
    }

    const { participants } = validationResult.data;
    const invalidIds = participants.filter(id => !validateObjectId(id));

    if (invalidIds.length > 0) {
      return ApiResponse({
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: "One or more participant ids are invalid",
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
        message: "Only group conversations can kick members",
        success: false
      });
    }

    if (conversation.admin.toString() !== user.id) {
      return ApiResponse({
        statusCode: STATUS_CODES.UNAUTHORIZED,
        message: "Only the group admin can kick members",
        success: false
      });
    }

    if (participants.includes(conversation.admin.toString())) {
      return ApiResponse({
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: "Group admin cannot be kicked",
        success: false
      });
    }

    const updatedConversation = await Conversation.findByIdAndUpdate(
      conversationId,
      {
        $pull: {
          participants: { $in: participants.map(id => new Types.ObjectId(id)) }
        }
      }
    );

    if (
      updatedConversation &&
      updatedConversation.participants.length <= 1 &&
      updatedConversation.participants.some(
        participant => participant.toString() === user.id
      )
    ) {
      await Promise.all([
        Message.deleteMany({
          conversationId: new Types.ObjectId(conversationId)
        }),
        Conversation.deleteOne({ _id: conversationId })
      ]);

      return ApiResponse({
        statusCode: STATUS_CODES.OK,
        success: true,
        message:
          "Member kicked successfully and conversation deleted because no other participants remain"
      });
    }

    return ApiResponse({
      statusCode: STATUS_CODES.OK,
      success: true,
      data: updatedConversation,
      message: "Member kicked successfully"
    });
  }
);

// https://yinfzs62id.ufs.sh/f/BeQ0UK7dOo0s2xn53ciDyls97t2KU6gY3QRHIpmiX5FEjrJc
