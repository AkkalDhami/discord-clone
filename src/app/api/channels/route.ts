import { STATUS_CODES } from "@/constants/status-codes";
import MemberRole from "@/enums/role.enum";
import { currentAuthUser } from "@/helpers/auth.helper";
import { validateRequest } from "@/lib/validation";
import Category from "@/models/category.model";
import Channel from "@/models/channel.model";
import Member from "@/models/member.model";
import { ApiResponse } from "@/utils/api-response";
import { AsyncHandler } from "@/utils/async-handler";
import { CreateChannelSchema } from "@/validators/channel";
import { isValidObjectId } from "mongoose";
import { NextRequest } from "next/server";

export const POST = AsyncHandler(async (req: NextRequest) => {
  const data = await req.json();
  const { searchParams } = new URL(req.url);
  const result = validateRequest(CreateChannelSchema, data);

  const user = await currentAuthUser();

  if (!user) {
    return ApiResponse({
      statusCode: STATUS_CODES.UNAUTHORIZED,
      message: "Unauthorized",
      success: false
    });
  }

  if (!result.success) {
    return ApiResponse({
      success: false,
      message: "Invalid data",
      error: result.errors,
      statusCode: STATUS_CODES.BAD_REQUEST
    });
  }

  const serverId = searchParams.get("serverId");
  const categoryId = searchParams.get("categoryId");

  if (!serverId) {
    return ApiResponse({
      success: false,
      message: "Server ID is required",
      statusCode: STATUS_CODES.BAD_REQUEST
    });
  }

  if (!isValidObjectId(serverId)) {
    return ApiResponse({
      success: false,
      message: "Invalid server ID",
      statusCode: STATUS_CODES.BAD_REQUEST
    });
  }

  if (categoryId && !isValidObjectId(categoryId)) {
    return ApiResponse({
      success: false,
      message: "Invalid category ID",
      statusCode: STATUS_CODES.BAD_REQUEST
    });
  }
  let category = null;
  if (categoryId) {
    category = await Category.findById(categoryId);
    if (!category) {
      return ApiResponse({
        success: false,
        message: "Category not found",
        statusCode: STATUS_CODES.NOT_FOUND
      });
    }
  }

  const members = await Member.find({
    serverId
  });

  const isAuthorized = members.some(
    member =>
      member.profileId.toString() === user.id.toString() &&
      [MemberRole.ADMIN, MemberRole.MODERATOR].includes(member.role)
  );

  if (!isAuthorized) {
    return ApiResponse({
      statusCode: STATUS_CODES.UNAUTHORIZED,
      message: "You are not authorized to create a channel in this server!",
      success: false
    });
  }

  const { name, type } = result.data;

  const channel = await Channel.create({
    name,
    type,
    serverId,
    profileId: user.id,
    categoryId: category?._id
  });

  return ApiResponse({
    success: true,
    message: "Channel created successfully",
    data: channel,
    statusCode: STATUS_CODES.CREATED
  });
});
