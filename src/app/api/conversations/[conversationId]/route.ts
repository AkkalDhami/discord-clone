import { STATUS_CODES } from "@/constants/status-codes";
import { currentAuthUser } from "@/helpers/auth.helper";
import Conversation from "@/models/conversation.model";
import Message from "@/models/message.model";
import { ApiResponse } from "@/utils/api-response";
import { AsyncHandler } from "@/utils/async-handler";
import { validateObjectId } from "@/utils/validate-objid";

export const DELETE = AsyncHandler(
  async (
    _req,
    {
      params
    }: {
      params: Promise<{
        conversationId: string;
      }>;
    }
  ) => {
    const user = await currentAuthUser();

    if (!user) {
      return ApiResponse({
        statusCode: STATUS_CODES.UNAUTHORIZED,
        message: "Unauthorized",
        success: false
      });
    }

    const { conversationId } = await params;

    if (!validateObjectId(conversationId)) {
      return ApiResponse({
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: "Invalid conversation id",
        success: false
      });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return ApiResponse({
        statusCode: STATUS_CODES.NOT_FOUND,
        message: "Conversation not found",
        success: false
      });
    }

    if (conversation.type !== "group") {
      return ApiResponse({
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: "Only group conversations can be deleted",
        success: false
      });
    }

    if (conversation.admin.toString() !== user.id) {
      return ApiResponse({
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: "You are not authorized to delete this group",
        success: false
      });
    }

    await Promise.all([
      Conversation.deleteOne({
        _id: conversationId
      }),
      Message.deleteMany({
        conversation: conversationId
      })
    ]);

    return ApiResponse({
      statusCode: STATUS_CODES.OK,
      success: true,
      message: "Group deleted successfully"
    });
  }
);
