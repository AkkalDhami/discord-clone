import { STATUS_CODES } from "@/constants/status-codes";
import ChannelType from "@/enums/channel.enum";
import MemberRole from "@/enums/role.enum";
import { currentAuthUser } from "@/helpers/auth.helper";
import { generateUUID } from "@/helpers/token.helper";
import { validateRequest } from "@/lib/validation";
import Channel from "@/models/channel.model";
import Member from "@/models/member.model";
import Server from "@/models/server.model";
import { ApiResponse } from "@/utils/api-response";
import { AsyncHandler } from "@/utils/async-handler";
import { ServerSchema } from "@/validators/server";
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

  const validationResult = validateRequest(ServerSchema, body);

  if (!validationResult.success) {
    return ApiResponse({
      statusCode: STATUS_CODES.BAD_REQUEST,
      message: "Invalid request body",
      success: false
    });
  }

  const { name, logo } = validationResult.data;

  const existingServer = await Server.findOne({ name });

  if (existingServer) {
    return ApiResponse({
      statusCode: STATUS_CODES.CONFLICT,
      message: "Server with this name already exists",
      success: false
    });
  }

  const server = await Server.create({
    name,
    logo,
    profileId: user.id,
    inviteCode: generateUUID()
  });

  await Channel.create({
    name: "general",
    type: ChannelType.TEXT,
    serverId: server._id,
    profileId: user.id
  });

  const member = new Member({
    profileId: user.id,
    role: MemberRole.ADMIN,
    serverId: server._id
  });

  await member.save();

  return ApiResponse({
    statusCode: STATUS_CODES.CREATED,
    message: "Server created successfully",
    success: true,
    data: server
  });
});
