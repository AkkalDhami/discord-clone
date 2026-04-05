import { STATUS_CODES } from "@/constants/status-codes";
import MemberRole from "@/enums/role.enum";
import { currentAuthUser } from "@/helpers/auth.helper";
import { validateRequest } from "@/lib/validation";
import Category from "@/models/category.model";
import Channel from "@/models/channel.model";
import Member from "@/models/member.model";
import { ApiResponse } from "@/utils/api-response";
import { AsyncHandler } from "@/utils/async-handler";
import { EditCategorySchema, EditCategorySchemaType } from "@/validators/category";
import mongoose, { isValidObjectId } from "mongoose";
import { NextRequest } from "next/server";

export const DELETE = AsyncHandler(
  async (
    req: NextRequest,
    { params }: { params: Promise<{ categoryId: string }> }
  ) => {
    const { categoryId } = await params;
    const user = await currentAuthUser();

    if (!user) {
      return ApiResponse({
        statusCode: STATUS_CODES.UNAUTHORIZED,
        message: "Unauthorized",
        success: false
      });
    }

    if (!isValidObjectId(categoryId)) {
      return ApiResponse({
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: "Invalid category ID",
        success: false
      });
    }

    const category = await Category.findById(categoryId);

    if (!category) {
      return ApiResponse({
        statusCode: STATUS_CODES.NOT_FOUND,
        message: "Category not found",
        success: false
      });
    }

    const member = await Member.findOne({
      profileId: user.id,
      serverId: category.serverId
    });

    if (!member) {
      return ApiResponse({
        statusCode: STATUS_CODES.NOT_FOUND,
        message: "You are not a member of this server",
        success: false
      });
    }

    if (![MemberRole.ADMIN, MemberRole.MODERATOR].includes(member.role)) {
      return ApiResponse({
        statusCode: STATUS_CODES.UNAUTHORIZED,
        message: "You are not authorized to delete this category",
        success: false
      });
    }

    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        await Channel.deleteMany({ categoryId: category._id }, { session });

        await Category.findByIdAndDelete(category._id, { session });
      });

      return ApiResponse({
        statusCode: STATUS_CODES.OK,
        message: "Category deleted successfully",
        success: true
      });
    } catch (error) {
      console.error("Delete transaction failed:", error);

      return ApiResponse({
        statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: "Failed to delete category",
        success: false
      });
    } finally {
      session.endSession();
    }
  }
);

export const PATCH = AsyncHandler(
  async (
    req: NextRequest,
    { params }: { params: Promise<{ categoryId: string }> }
  ) => {
    const { categoryId } = await params;
    const user = await currentAuthUser();

    if (!user) {
      return ApiResponse({
        statusCode: STATUS_CODES.UNAUTHORIZED,
        message: "Unauthorized",
        success: false
      });
    }

    if (!isValidObjectId(categoryId)) {
      return ApiResponse({
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: "Invalid category ID",
        success: false
      });
    }

    const category = await Category.findById(categoryId);

    if (!category) {
      return ApiResponse({
        statusCode: STATUS_CODES.NOT_FOUND,
        message: "Category not found",
        success: false
      });
    }

    const member = await Member.findOne({
      profileId: user.id,
      serverId: category.serverId
    });

    if (!member) {
      return ApiResponse({
        statusCode: STATUS_CODES.NOT_FOUND,
        message: "You are not a member of this server",
        success: false
      });
    }

    if (![MemberRole.ADMIN, MemberRole.MODERATOR].includes(member.role)) {
      return ApiResponse({
        statusCode: STATUS_CODES.UNAUTHORIZED,
        message: "You are not authorized to edit this category",
        success: false
      });
    }

    const body: EditCategorySchemaType = await req.json();

    const result = validateRequest(EditCategorySchema, body);

    if (!result.success) {
      return ApiResponse({
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: "Invalid request body",
        success: false
      });
    }

    const { name, private: isPrivate } = result.data;

    const updatedCategory = await Category.findByIdAndUpdate(categoryId, {
      name,
      private: isPrivate
    });

    return ApiResponse({
      statusCode: STATUS_CODES.OK,
      message: "Category updated successfully",
      success: true,
      data: updatedCategory
    });
  }
);
