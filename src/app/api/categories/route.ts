import { STATUS_CODES } from "@/constants/status-codes";
import MemberRole from "@/enums/role.enum";
import { currentAuthUser } from "@/helpers/auth.helper";
import { validateRequest } from "@/lib/validation";
import Category from "@/models/category.model";
import Member from "@/models/member.model";
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

  const { name, private: isPrivate } = result.data;

  const category = await Category.create({
    name,
    private: isPrivate,
    serverId,
    profileId: user.id
  });

  return ApiResponse({
    success: true,
    message: "Category created successfully",
    data: category,
    statusCode: STATUS_CODES.CREATED
  });
});
