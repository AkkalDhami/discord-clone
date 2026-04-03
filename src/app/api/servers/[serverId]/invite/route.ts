import { STATUS_CODES } from "@/constants/status-codes";
import { currentAuthUser } from "@/helpers/auth.helper";
import { generateUUID } from "@/helpers/token.helper";
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

    const server = await Server.findByIdAndUpdate(
      serverId,
      {
        inviteCode: generateUUID()
      },
      { new: true }
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
