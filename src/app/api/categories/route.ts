import { STATUS_CODES } from "@/constants/status-codes";
import MemberRole from "@/enums/role.enum";
import { currentAuthUser } from "@/helpers/auth.helper";
import { validateRequest } from "@/lib/validation";
import Category from "@/models/category.model";
import Member from "@/models/member.model";
import Server from "@/models/server.model";
import { ApiResponse } from "@/utils/api-response";
import { AsyncHandler } from "@/utils/async-handler";
import { CreateCategorySchema } from "@/validators/category";
import { NextRequest } from "next/server";

export const POST = AsyncHandler(async (req: NextRequest) => {
  const data = await req.json();
  const { searchParams } = new URL(req.url);
  const result = validateRequest(CreateCategorySchema, data);

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
  if (!serverId) {
    return ApiResponse({
      success: false,
      message: "Server ID is required",
      statusCode: STATUS_CODES.BAD_REQUEST
    });
  }

  const server = await Server.findById(serverId);

  if (!server) {
    return ApiResponse({
      success: false,
      message: "Server not found",
      statusCode: STATUS_CODES.NOT_FOUND
    });
  }

  const member = await Member.findOne({
    serverId,
    profileId: user.id
  });

  if (!member) {
    return ApiResponse({
      success: false,
      message: "You are not a member of this server",
      statusCode: STATUS_CODES.BAD_REQUEST
    });
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

  if (data.memberIds && data.memberIds.length > 0) {
    const members = await Member.find({
      _id: { $in: data.memberIds },
      serverId,
      profileId: { $ne: user.id }
    });

    if (members.length !== data.memberIds.length) {
      return ApiResponse({
        success: false,
        message: "Some members are not found in the server",
        statusCode: STATUS_CODES.BAD_REQUEST
      });
    }
  }

  const { name, private: isPrivate } = result.data;

  const category = await Category.create({
    name,
    private: isPrivate,
    serverId,
    profileId: user.id,
    privateMembers: [...(data.memberIds || []), member._id]
  });

  return ApiResponse({
    success: true,
    message: "Category created successfully",
    data: category,
    statusCode: STATUS_CODES.CREATED
  });
});
