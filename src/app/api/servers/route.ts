import { STATUS_CODES } from "@/constants/status-codes";
import MemberRole from "@/enums/role.enum";
import { currentAuthUser } from "@/helpers/auth.helper";
import { generateUUID } from "@/helpers/token.helper";
import Member from "@/models/member.model";
import Server from "@/models/server.model";
import { ApiResponse } from "@/utils/api-response";
import { AsyncHandler } from "@/utils/async-handler";
import { NextRequest } from "next/server";

export const POST = AsyncHandler(async (req: NextRequest) => {
  const body = await req.json();

  const user = await currentAuthUser();

  if (!user) {
    return ApiResponse({
      statusCode: STATUS_CODES.UNAUTHORIZED,
      message: "Unauthorized",
      success: false
    });
  }

  const { name, logo } = body;

  if (!name) {
    return ApiResponse({
      statusCode: STATUS_CODES.BAD_REQUEST,
      message: "Name is required",
      success: false
    });
  }

  const existingServer = await Server.findOne({ name });

  if (existingServer) {
    return ApiResponse({
      statusCode: STATUS_CODES.CONFLICT,
      message: "Server already exists",
      success: false
    });
  }

  const member = new Member({
    profileId: user.id,
    role: MemberRole.ADMIN
  });

  await member.save();

  const server = await Server.create({
    name,
    logo,
    profileId: user.id,
    inviteCode: generateUUID(),
    members: [member._id]
  });

  await member.updateOne({ serverId: server._id });

  return ApiResponse({
    statusCode: STATUS_CODES.CREATED,
    message: "Server created successfully",
    success: true,
    data: server
  });
});
