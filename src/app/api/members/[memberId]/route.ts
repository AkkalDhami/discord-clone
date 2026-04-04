import { STATUS_CODES } from "@/constants/status-codes";
import MemberRole from "@/enums/role.enum";

import { currentAuthUser } from "@/helpers/auth.helper";
import Member from "@/models/member.model";

import { ApiResponse } from "@/utils/api-response";
import { AsyncHandler } from "@/utils/async-handler";
import { NextRequest } from "next/server";

export const PATCH = AsyncHandler(
  async (
    req: NextRequest,
    { params }: { params: Promise<{ memberId: string }> }
  ) => {
    const { searchParams } = new URL(req.url);
    const { memberId } = await params;
    const user = await currentAuthUser();

    const serverId = searchParams.get("serverId");
    const { role } = await req.json();

    if (!user) {
      return ApiResponse({
        statusCode: STATUS_CODES.UNAUTHORIZED,
        message: "Unauthorized",
        success: false
      });
    }

    if (!serverId) {
      return ApiResponse({
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: "Server ID is required",
        success: false
      });
    }

    if (!memberId) {
      return ApiResponse({
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: "Member ID is required",
        success: false
      });
    }

    if (!Object.values(MemberRole).includes(role)) {
      return ApiResponse({
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: "Invalid role",
        success: false
      });
    }

    const member = await Member.findById(memberId);

    const adminMember = await Member.findOne({
      profileId: user.id,
      serverId,
      role: MemberRole.ADMIN
    });

    if (!adminMember) {
      return ApiResponse({
        statusCode: STATUS_CODES.UNAUTHORIZED,
        message: "You are not authorized to update this member!",
        success: false
      });
    }

    if (!member) {
      return ApiResponse({
        statusCode: STATUS_CODES.NOT_FOUND,
        message: "Member not found",
        success: false
      });
    }

    // console.log({
    //   member,
    //   user
    // });

    if (
      member.profileId.toString() !== user.id.toString() &&
      adminMember.role !== MemberRole.ADMIN
    ) {
      return ApiResponse({
        statusCode: STATUS_CODES.UNAUTHORIZED,
        message: "You are not authorized to update this member!",
        success: false
      });
    }

    if (member.role === MemberRole.ADMIN) {
      return ApiResponse({
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: "Admin role cannot be changed",
        success: false
      });
    }

    if (member.role === role) {
      return ApiResponse({
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: "Member already has this role",
        success: false
      });
    }

    const updatedMember = await Member.findOneAndUpdate(
      {
        _id: memberId
      },
      {
        role
      }
    ).sort({ role: 1 });

    if (!updatedMember) {
      return ApiResponse({
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: "Failed to update member",
        success: false
      });
    }

    return ApiResponse({
      statusCode: STATUS_CODES.OK,
      message: `Member role updated to ${role?.toLocaleLowerCase()}`,
      success: true,
      data: updatedMember
    });
  }
);

export const DELETE = AsyncHandler(
  async (
    req: NextRequest,
    { params }: { params: Promise<{ memberId: string }> }
  ) => {
    const { searchParams } = new URL(req.url);
    const { memberId } = await params;
    const user = await currentAuthUser();

    const serverId = searchParams.get("serverId");

    if (!user) {
      return ApiResponse({
        statusCode: STATUS_CODES.UNAUTHORIZED,
        message: "Unauthorized",
        success: false
      });
    }

    if (!serverId) {
      return ApiResponse({
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: "Server ID is required",
        success: false
      });
    }

    if (!memberId) {
      return ApiResponse({
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: "Member ID is required",
        success: false
      });
    }

    const member = await Member.findById(memberId);

    const adminMember = await Member.findOne({
      profileId: user.id,
      serverId,
      role: MemberRole.ADMIN
    });

    if (!adminMember) {
      return ApiResponse({
        statusCode: STATUS_CODES.UNAUTHORIZED,
        message: "You are not authorized to delete this member!",
        success: false
      });
    }

    if (!member) {
      return ApiResponse({
        statusCode: STATUS_CODES.NOT_FOUND,
        message: "Member not found",
        success: false
      });
    }

    if (
      member.profileId.toString() !== user.id.toString() &&
      adminMember.role !== MemberRole.ADMIN
    ) {
      return ApiResponse({
        statusCode: STATUS_CODES.UNAUTHORIZED,
        message: "You are not authorized to delete this member!",
        success: false
      });
    }

    if (member.role === MemberRole.ADMIN) {
      return ApiResponse({
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: "Admin cannot be kicked!",
        success: false
      });
    }

    const deletedMember = await Member.findByIdAndDelete(memberId);

    if (!deletedMember) {
      return ApiResponse({
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: "Failed to delete member",
        success: false
      });
    }

    return ApiResponse({
      statusCode: STATUS_CODES.OK,
      message: "Member kicked successfully",
      success: true,
      data: deletedMember
    });
  }
);
