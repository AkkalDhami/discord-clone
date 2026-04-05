import { STATUS_CODES } from "@/constants/status-codes";
import ChannelType from "@/enums/channel.enum";
import MemberRole from "@/enums/role.enum";
import { currentAuthUser } from "@/helpers/auth.helper";
import { generateUUID } from "@/helpers/token.helper";
import { validateRequest } from "@/lib/validation";
import Category from "@/models/category.model";
import Channel from "@/models/channel.model";
import Member from "@/models/member.model";
import Server from "@/models/server.model";
import { ApiResponse } from "@/utils/api-response";
import { AsyncHandler } from "@/utils/async-handler";
import { ServerSchema } from "@/validators/server";
import { NextRequest } from "next/server";

import mongoose from "mongoose";
import { logger } from "better-auth";

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

  const session = await mongoose.startSession();

  let server;

  try {
    await session.withTransaction(async () => {
      // 1. Create Server
      server = await Server.create(
        [
          {
            name,
            logo,
            profileId: user.id,
            inviteCode: generateUUID()
          }
        ],
        { session }
      );

      const serverDoc = server[0];

      // 2. Create Categories
      const [textCategory] = await Category.create(
        [
          {
            name: "Text Channels",
            serverId: serverDoc._id,
            profileId: user.id
          }
        ],
        { session }
      );

      const [voiceCategory] = await Category.create(
        [
          {
            name: "Voice Channels",
            serverId: serverDoc._id,
            profileId: user.id
          }
        ],
        { session }
      );

      const [videoCategory] = await Category.create(
        [
          {
            name: "Video Channels",
            serverId: serverDoc._id,
            profileId: user.id
          }
        ],
        { session }
      );

      // 3. Create Channels
      await Channel.create(
        [
          {
            name: "general",
            type: ChannelType.TEXT,
            serverId: serverDoc._id,
            profileId: user.id,
            categoryId: textCategory._id
          },
          {
            name: "general",
            type: ChannelType.AUDIO,
            serverId: serverDoc._id,
            profileId: user.id,
            categoryId: voiceCategory._id
          },
          {
            name: "general",
            type: ChannelType.VIDEO,
            serverId: serverDoc._id,
            profileId: user.id,
            categoryId: videoCategory._id
          }
        ],
        { session, ordered: true }
      );

      // 4. Create Member
      await Member.create(
        [
          {
            profileId: user.id,
            role: MemberRole.ADMIN,
            serverId: serverDoc._id
          }
        ],
        { session }
      );
    });

    return ApiResponse({
      statusCode: STATUS_CODES.CREATED,
      message: "Server created successfully",
      success: true,
      data: server?.[0]
    });
  } catch (error) {
    logger.error("Transaction failed:", error);

    return ApiResponse({
      statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: "Failed to create server",
      success: false
    });
  } finally {
    session.endSession();
  }
});
