import { currentAuthUser } from "@/helpers/auth.helper";
import { STATUS_CODES } from "@/constants/status-codes";
import Member from "@/models/member.model";
import Server from "@/models/server.model";
import { ApiResponse } from "@/utils/api-response";
import { AsyncHandler } from "@/utils/async-handler";
import { NextRequest } from "next/server";

export const GET = AsyncHandler(
  async (
    req: NextRequest,
    { params }: { params: Promise<{ inviteId: string }> }
  ) => {
    const { inviteId } = await params;

    const user = await currentAuthUser();

    if (!user) {
      return ApiResponse({
        statusCode: STATUS_CODES.UNAUTHORIZED,
        message: "User not authenticated!",
        success: false
      });
    }

    const server = await Server.findOne({
      inviteCode: inviteId
    })
      .select("_id name logo description createdAt")
      .lean();

    const isAlreadyMember = await Member.exists({
      profileId: user?.id,
      serverId: server?._id
    });

    if (!server) {
      return ApiResponse({
        statusCode: STATUS_CODES.NOT_FOUND,
        message: "Invalid invite code!",
        success: false
      });
    }

    const members = await Member.find({
      serverId: server._id
    }).lean();

    return ApiResponse({
      statusCode: STATUS_CODES.OK,
      message: "Server details fetched successfully!",
      success: true,
      data: {
        ...server,
        members: members.length,
        isAlreadyMember: Boolean(isAlreadyMember)
      }
    });
  }
);
