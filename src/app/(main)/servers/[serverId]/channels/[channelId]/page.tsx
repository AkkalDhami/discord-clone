import { ChatInput } from "@/app/api/servers/chat/chat-input";
import { ChannelWelcome } from "@/app/api/servers/chat/chat-welcome";
import { ChatHeader } from "@/components/layouts/chat-header";
import { MessagesSection } from "@/components/messages/message-section";
import { ScrollArea } from "@/components/ui/scroll-area";

import { currentAuthUser } from "@/helpers/auth.helper";
import { Channel as ChannelInterface } from "@/interface";
import { getOrCreateConversation } from "@/lib/conversation";
import Channel from "@/models/channel.model";
import Member from "@/models/member.model";
import mongoose from "mongoose";

import { redirect } from "next/navigation";

export default async function Page(
  props: PageProps<"/servers/[serverId]/channels/[channelId]">
) {
  const profile = await currentAuthUser();

  if (!profile) {
    return redirect("/signin");
  }

  const { params } = props;
  const { serverId, channelId } = await params;

  const [channel] = (await Channel.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(channelId),
        serverId: new mongoose.Types.ObjectId(serverId)
      }
    },
    {
      $lookup: {
        from: "categories",
        localField: "categoryId",
        foreignField: "_id",
        as: "category"
      }
    },
    {
      $unwind: {
        path: "$category",
        preserveNullAndEmptyArrays: true
      }
    }
  ])) as ChannelInterface[];

  // console.log({ channel });
  const member = await Member.findOne({
    profileId: profile.id,
    serverId
  });

  if (!channel || !member) {
    return redirect("/");
  }

  const conversation = await getOrCreateConversation({
    admin: profile.id,
    serverId,
    type: "server",
    channelId,
    participants: [member.profileId.toString(), profile.id]
  });

  // console.log({ conversation });

  const conversationId = conversation?._id?.toString();

  return (
    <div className="flex h-full flex-col border-y">
      <ChatHeader
        serverId={serverId}
        name={channel.name}
        type="channel"
        isPrivate={channel?.category?.private ?? false}
      />
      <ScrollArea className="pt-3 sm:h-[calc(100vh-10.5rem)]">
        <ChannelWelcome
          channel={{
            _id: channel._id.toString(),
            name: channel.name,
            type: channel.type
          }}
          isPrivate={channel?.category?.private ?? false}
        />

        <MessagesSection conversationId={conversationId as string} />
      </ScrollArea>
      <ChatInput
        query={{
          channelId,
          serverId,
          conversationId
        }}
        name={channel.name}
        type="channel"
      />
    </div>
  );
}
