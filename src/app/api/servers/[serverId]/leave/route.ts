import { STATUS_CODES } from "@/constants/status-codes";
import MemberRole from "@/enums/role.enum";
import { currentAuthUser } from "@/helpers/auth.helper";
import Member from "@/models/member.model";
import Server from "@/models/server.model";
import { ApiResponse } from "@/utils/api-response";
import { AsyncHandler } from "@/utils/async-handler";
import { isValidObjectId } from "mongoose";
import { NextRequest } from "next/server";

export const PATCH = AsyncHandler(
  async (
    _req: NextRequest,
    { params }: { params: Promise<{ serverId: string }> }
  ) => {
    const { serverId } = await params;
    const user = await currentAuthUser();

    if (!user) {
      return ApiResponse({
        statusCode: STATUS_CODES.UNAUTHORIZED,
        message: "Unauthorized",
        success: false
      });
    }

    if (!isValidObjectId(serverId)) {
      return ApiResponse({
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: "Invalid server ID",
        success: false
      });
    }

    const server = await Server.findById(serverId);

    if (!server) {
      return ApiResponse({
        statusCode: STATUS_CODES.NOT_FOUND,
        message: "Server not found",
        success: false
      });
    }

    const member = await Member.findOne({
      profileId: user.id,
      serverId: server._id
    });

    if (!member) {
      return ApiResponse({
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: "You are not a member of this server",
        success: false
      });
    }

    if (member.role === MemberRole.ADMIN) {
      return ApiResponse({
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: "You cannot leave the server as admin",
        success: false
      });
    }

    const updatedMember = await Member.findByIdAndDelete(member._id);

    if (!updatedMember) {
      return ApiResponse({
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: "Failed to leave server",
        success: false
      });
    }

    return ApiResponse({
      statusCode: STATUS_CODES.OK,
      message: "You have left the server successfully",
      success: true
    });
  }
);
