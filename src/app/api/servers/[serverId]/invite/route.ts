import { STATUS_CODES } from "@/constants/status-codes";
import { currentAuthUser } from "@/helpers/auth.helper";
import { generateUUID } from "@/helpers/token.helper";
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

    const server = await Server.findOneAndUpdate(
      {
        _id: serverId,
        profileId: user.id
      },
      {
        inviteCode: generateUUID()
      }
    );

    if (!server) {
      return ApiResponse({
        statusCode: STATUS_CODES.NOT_FOUND,
        message: "Server not found",
        success: false
      });
    }

    return ApiResponse({
      statusCode: STATUS_CODES.OK,
      message: "Server invite code generated successfully",
      success: true,
      data: {
        inviteCode: server.inviteCode
      }
    });
  }
);

export const POST = AsyncHandler(
  async (
    req: NextRequest,
    { params }: { params: Promise<{ serverId: string }> }
  ) => {
    const { serverId } = await params;
    const { inviteCode } = await req.json();
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

    if (!inviteCode) {
      return ApiResponse({
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: "Invite code is required",
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

    if (server.inviteCode !== inviteCode) {
      return ApiResponse({
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: "Invalid or expired invite code",
        success: false
      });
    }

    const member = await Member.findOne({
      profileId: user.id,
      serverId: server._id
    });

    if (member) {
      return ApiResponse({
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: "You are already a member of this server",
        success: false
      });
    }

    const updatedServer = await Member.create({
      profileId: user.id,
      serverId: server._id
    });

    if (!updatedServer) {
      return ApiResponse({
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: "Failed to join server",
        success: false
      });
    }

    return ApiResponse({
      statusCode: STATUS_CODES.OK,
      message: `You have joined the server as ${updatedServer.role.toLocaleLowerCase()}`,
      success: true,
      data: {
        inviteCode: server.inviteCode
      }
    });
  }
);
