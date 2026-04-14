import { STATUS_CODES } from "@/constants/status-codes";
import MemberRole from "@/enums/role.enum";
import { currentAuthUser } from "@/helpers/auth.helper";
import Category from "@/models/category.model";
import Member from "@/models/member.model";
import Server from "@/models/server.model";
import { ApiResponse } from "@/utils/api-response";
import { AsyncHandler } from "@/utils/async-handler";
import { isValidObjectId } from "mongoose";
import { NextRequest } from "next/server";

export const PUT = AsyncHandler(
  async (
    req: NextRequest,
    {
      params
    }: {
      params: {
        categoryId: string;
      };
    }
  ) => {
    const { searchParams } = new URL(req.url);
    const user = await currentAuthUser();
    const { categoryId } = await params;

    const body: {
      type: "add" | "remove";
      memberIds: string[];
    } = await req.json();

    if (!user) {
      return ApiResponse({
        statusCode: STATUS_CODES.UNAUTHORIZED,
        message: "Unauthorized",
        success: false
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

    if (!isValidObjectId(categoryId)) {
      return ApiResponse({
        success: false,
        message: "Invalid category ID",
        statusCode: STATUS_CODES.BAD_REQUEST
      });
    }

    const [server, category] = await Promise.all([
      Server.findById(serverId),
      Category.findById(categoryId)
    ]);

    if (!server || !category) {
      return ApiResponse({
        success: false,
        message: "Server or Category not found",
        statusCode: STATUS_CODES.BAD_REQUEST
      });
    }

    const currentMember = await Member.findOne({
      profileId: user.id,
      serverId: serverId
    });

    if (!currentMember) {
      return ApiResponse({
        success: false,
        message: "You are not a member of this server",
        statusCode: STATUS_CODES.BAD_REQUEST
      });
    }

    if (
      ![MemberRole.ADMIN, MemberRole.MODERATOR].includes(currentMember.role)
    ) {
      return ApiResponse({
        statusCode: STATUS_CODES.UNAUTHORIZED,
        message: "You are not authorized!",
        success: false
      });
    }

    const memberIds = body.memberIds;
    if (!memberIds?.length) {
      return ApiResponse({
        success: false,
        message: "Member IDs are required",
        statusCode: STATUS_CODES.BAD_REQUEST
      });
    }

    const targetMembers = await Member.find({
      _id: { $in: memberIds },
      serverId: serverId
    });

    if (!targetMembers.length) {
      return ApiResponse({
        success: false,
        message: "Members not found",
        statusCode: STATUS_CODES.BAD_REQUEST
      });
    }

    if (body.type === "add") {
      const existingIds =
        category.privateMembers?.map(id => id.toString()) || [];

      const newMembers = targetMembers
        .map(m => m._id.toString())
        .filter(id => !existingIds.includes(id));

      if (!newMembers.length) {
        return ApiResponse({
          success: false,
          message: "All members already exist in category",
          statusCode: STATUS_CODES.BAD_REQUEST
        });
      }

      await Category.findByIdAndUpdate(categoryId, {
        $addToSet: { privateMembers: { $each: newMembers } }
      });

      return ApiResponse({
        success: true,
        message: "Members added to category",
        statusCode: STATUS_CODES.OK
      });
    }

    if (body.type === "remove") {
      const hasAdmin = targetMembers.some(m => m.role === MemberRole.ADMIN);

      if (hasAdmin) {
        return ApiResponse({
          success: false,
          message: "Admin cannot be removed from category",
          statusCode: STATUS_CODES.BAD_REQUEST
        });
      }

      const existingIds =
        category.privateMembers?.map(id => id.toString()) || [];

      const removableMembers = targetMembers
        .map(m => m._id.toString())
        .filter(id => existingIds.includes(id));

      if (!removableMembers.length) {
        return ApiResponse({
          success: false,
          message: "Members are not in this category",
          statusCode: STATUS_CODES.BAD_REQUEST
        });
      }

      await Category.findByIdAndUpdate(categoryId, {
        $pull: { privateMembers: { $in: removableMembers } }
      });

      return ApiResponse({
        success: true,
        message: "Members removed from category",
        statusCode: STATUS_CODES.OK
      });
    }

    return ApiResponse({
      success: false,
      message: "Failed to update category members",
      statusCode: STATUS_CODES.BAD_REQUEST
    });
  }
);
