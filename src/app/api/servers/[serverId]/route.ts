import { STATUS_CODES } from "@/constants/status-codes";
import MemberRole from "@/enums/role.enum";

import { currentAuthUser } from "@/helpers/auth.helper";
import { validateRequest } from "@/lib/validation";
import Category from "@/models/category.model";
import Channel from "@/models/channel.model";
import Member from "@/models/member.model";

import Server from "@/models/server.model";
import { utapi } from "@/server/uploadting";
import { ApiResponse } from "@/utils/api-response";
import { AsyncHandler } from "@/utils/async-handler";
import { EditServerSchema, EditServerSchemaType } from "@/validators/server";
import mongoose, { isValidObjectId } from "mongoose";
import { NextRequest } from "next/server";

export const PATCH = AsyncHandler(
  async (
    req: NextRequest,
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

    const body: EditServerSchemaType = await req.json();

    const result = validateRequest(EditServerSchema, body);

    if (!result.success) {
      return ApiResponse({
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: "Invalid request body",
        success: false
      });
    }

    const { name, logo } = result.data;

    const existingServer = await Server.findOne({
      _id: serverId
    });

    if (existingServer?.profileId.toString() !== user.id) {
      return ApiResponse({
        statusCode: STATUS_CODES.UNAUTHORIZED,
        message: "You are not authorized to edit this server",
        success: false
      });
    }

    if (existingServer && existingServer.profileId.toString() !== user.id) {
      return ApiResponse({
        statusCode: STATUS_CODES.CONFLICT,
        message: "Server with this name already exists",
        success: false
      });
    }

    if (logo && existingServer?.logo) {
      const logoArray = existingServer?.logo?.split("/");
      await utapi.deleteFiles(logoArray[logoArray.length - 1]);
    }

    const server = await Server.findByIdAndUpdate(serverId, {
      name,
      logo
    });

    return ApiResponse({
      statusCode: STATUS_CODES.OK,
      message: "Server updated successfully",
      success: true,
      data: server
    });
  }
);

export const DELETE = AsyncHandler(
  async (
    req: NextRequest,
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

    const existingServer = await Server.findById(serverId);

    if (!existingServer) {
      return ApiResponse({
        statusCode: STATUS_CODES.NOT_FOUND,
        message: "Server not found",
        success: false
      });
    }

    const member = await Member.findOne({
      profileId: user.id,
      serverId: existingServer._id
    });

    if (!member) {
      return ApiResponse({
        statusCode: STATUS_CODES.NOT_FOUND,
        message: "You are not a member of this server",
        success: false
      });
    }

    if (
      member.role !== MemberRole.ADMIN &&
      existingServer.profileId.toString() !== user.id
    ) {
      return ApiResponse({
        statusCode: STATUS_CODES.UNAUTHORIZED,
        message: "You are not authorized to delete this server",
        success: false
      });
    }

    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        await Channel.deleteMany({ serverId: existingServer._id }, { session });

        await Category.deleteMany(
          { serverId: existingServer._id },
          { session }
        );

        await Member.deleteMany({ serverId: existingServer._id }, { session });

        await Server.findByIdAndDelete(existingServer._id, { session });

        const logo = existingServer?.logo?.split("/");

        await utapi.deleteFiles(logo[logo.length - 1]);
      });

      return ApiResponse({
        statusCode: STATUS_CODES.OK,
        message: "Server deleted successfully",
        success: true
      });
    } catch (error) {
      console.error("Delete transaction failed:", error);

      return ApiResponse({
        statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: "Failed to delete server",
        success: false
      });
    } finally {
      session.endSession();
    }
  }
);
