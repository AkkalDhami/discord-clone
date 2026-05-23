import { splitContent } from "@/utils/split-content";
import { STATUS_CODES } from "@/constants/status-codes";
import { currentAuthUser } from "@/helpers/auth.helper";
import { PartialConversation } from "@/interface";
import Conversation from "@/models/conversation.model";
import { FilterSearchConversation } from "@/types/friend";
import { ApiResponse } from "@/utils/api-response";
import { AsyncHandler } from "@/utils/async-handler";

export const GET = AsyncHandler(async () => {
  const user = await currentAuthUser();

  if (!user) {
    return ApiResponse({
      statusCode: STATUS_CODES.UNAUTHORIZED,
      message: "Unauthorized",
      success: false
    });
  }

  const conversations = (await Conversation.find({
    participants: {
      $in: [user.id]
    }
  })
    .sort({ updatedAt: -1 })
    .lean()
    .populate(
      "participants",
      "_id username avatar"
    )) as unknown as PartialConversation[];

  const directConversaions = conversations
    .filter(conversation => conversation.type === "direct")
    .map(f => {
      const friend = f.participants?.find(p => p._id.toString() !== user.id);
      return {
        _id: friend?._id.toString() || f._id.toString(),
        name: friend?.username,
        type: "direct",
        logo: friend?.avatar?.url
      };
    });

  const groupConversaions = conversations
    .filter(conversation => conversation.type === "group")
    .map(f => ({
      _id: f._id.toString(),
      name: f.name,
      type: "group",
      logo: f?.logo
    }));

  const filteredConversations: FilterSearchConversation[] = [
    ...directConversaions,
    ...groupConversaions
  ]
    .map(conversation => ({
      _id: conversation._id.toString(),
      name: splitContent(conversation.name || ""),
      type: conversation.type as "direct" | "group"
    }))
    .slice(0, 20);

  return ApiResponse({
    statusCode: STATUS_CODES.OK,
    message: "Success",
    success: true,
    data: { data: filteredConversations }
  });
});
