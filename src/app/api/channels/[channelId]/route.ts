import { STATUS_CODES } from "@/constants/status-codes";
import MemberRole from "@/enums/role.enum";
import { currentAuthUser } from "@/helpers/auth.helper";
import { validateRequest } from "@/lib/validation";
import Channel from "@/models/channel.model";
import Member from "@/models/member.model";
import { ApiResponse } from "@/utils/api-response";
import { AsyncHandler } from "@/utils/async-handler";
import { EditCategorySchemaType } from "@/validators/category";
import { EditChannelSchema } from "@/validators/channel";
import { isValidObjectId } from "mongoose";
import { NextRequest } from "next/server";

export const DELETE = AsyncHandler(
  async (
    req: NextRequest,
    { params }: { params: Promise<{ channelId: string }> }
  ) => {
    const { channelId } = await params;
    const user = await currentAuthUser();

    if (!user) {
      return ApiResponse({
        statusCode: STATUS_CODES.UNAUTHORIZED,
        message: "Unauthorized",
        success: false
      });
    }

    if (!isValidObjectId(channelId)) {
      return ApiResponse({
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: "Invalid channel ID",
        success: false
      });
    }

    const channel = await Channel.findById(channelId);

    if (!channel) {
      return ApiResponse({
        statusCode: STATUS_CODES.NOT_FOUND,
        message: "Channel not found",
        success: false
      });
    }

    const member = await Member.findOne({
      profileId: user.id,
      serverId: channel.serverId
    });

    if (!member) {
      return ApiResponse({
        statusCode: STATUS_CODES.NOT_FOUND,
        message: "You are not a member of this server",
        success: false
      });
    }

    if (![MemberRole.ADMIN].includes(member.role)) {
      return ApiResponse({
        statusCode: STATUS_CODES.UNAUTHORIZED,
        message: "You are not authorized to delete this channel",
        success: false
      });
    }

    await Channel.deleteOne({ _id: channel._id });

    return ApiResponse({
      statusCode: STATUS_CODES.OK,
      message: "Channel deleted successfully",
      success: true
    });
  }
);

export const PATCH = AsyncHandler(
  async (
    req: NextRequest,
    { params }: { params: Promise<{ channelId: string }> }
  ) => {
    const { channelId } = await params;
    const user = await currentAuthUser();

    if (!user) {
      return ApiResponse({
        statusCode: STATUS_CODES.UNAUTHORIZED,
        message: "Unauthorized",
        success: false
      });
    }

    if (!isValidObjectId(channelId)) {
      return ApiResponse({
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: "Invalid channel ID",
        success: false
      });
    }

    const channel = await Channel.findById(channelId);

    if (!channel) {
      return ApiResponse({
        statusCode: STATUS_CODES.NOT_FOUND,
        message: "Channel not found",
        success: false
      });
    }

    const member = await Member.findOne({
      profileId: user.id,
      serverId: channel.serverId
    });

    if (!member) {
      return ApiResponse({
        statusCode: STATUS_CODES.NOT_FOUND,
        message: "You are not a member of this server",
        success: false
      });
    }

    if (![MemberRole.ADMIN, MemberRole.MODERATOR].includes(member.role)) {
      return ApiResponse({
        statusCode: STATUS_CODES.UNAUTHORIZED,
        message: "You are not authorized to edit this channel",
        success: false
      });
    }

    const body: EditCategorySchemaType = await req.json();

    const result = validateRequest(EditChannelSchema, body);

    if (!result.success) {
      return ApiResponse({
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: "Invalid request body",
        success: false
      });
    }

    const { name, type } = result.data;

    const updatedChannel = await Channel.findByIdAndUpdate(channelId, {
      name,
      type
    });

    return ApiResponse({
      statusCode: STATUS_CODES.OK,
      message: "Channel updated successfully",
      success: true,
      data: updatedChannel
    });
  }
);
