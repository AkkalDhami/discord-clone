import { STATUS_CODES } from "@/constants/status-codes";
import MemberRole from "@/enums/role.enum";
import { currentAuthUser } from "@/helpers/auth.helper";
import Category from "@/models/category.model";
import Member from "@/models/member.model";
import Server from "@/models/server.model";
import { ApiResponse } from "@/utils/api-response";
import { AsyncHandler } from "@/utils/async-handler";
import { NextRequest } from "next/server";

export const PUT = AsyncHandler(
  async (
    req: NextRequest,
    {
      params
    }: {
      params: {
        categoryId: string;
        memberId: string;
      };
    }
  ) => {
    const { searchParams } = new URL(req.url);
    const user = await currentAuthUser();
    const { categoryId, memberId } = await params;

    const body: { type: "add" | "remove" } = await req.json();

    if (!user) {
      return ApiResponse({
        statusCode: STATUS_CODES.UNAUTHORIZED,
        message: "Unauthorized",
        success: false
      });
    }

    console.log([params]);

    const member = await Member.findOne({
      _id: memberId
      // profileId: user.id
    });

    if (!member) {
      return ApiResponse({
        success: false,
        message: "You are not a member of this server",
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
        message:
          "You are not authorized to remove a member from this category!",
        success: false
      });
    }

    if (member.role === MemberRole.ADMIN) {
      return ApiResponse({
        success: false,
        message: "Admin cannot be removed from the category",
        statusCode: STATUS_CODES.BAD_REQUEST
      });
    }

    const category = await Category.findById(categoryId);

    if (!category) {
      return ApiResponse({
        success: false,
        message: "Category not found",
        statusCode: STATUS_CODES.NOT_FOUND
      });
    }

    if (category.private && !category.privateMembers?.includes(member._id)) {
      return ApiResponse({
        success: false,
        message: "Member is already kicked from this category",
        statusCode: STATUS_CODES.BAD_REQUEST
      });
    }

    await Category.findOneAndUpdate(
      {
        _id: categoryId
      },
      {
        ...(body.type === "add"
          ? { $push: { privateMembers: member._id } }
          : { $pull: { privateMembers: member._id } })
      }
    );

    return ApiResponse({
      success: true,
      message: "Member kicked from category",
      statusCode: STATUS_CODES.OK
    });
  }
);
