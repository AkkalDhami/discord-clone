import { ChatInput } from "@/components/chat/chat-input";
import { ChatHeader } from "@/components/layouts/chat-header";
import { ScrollArea } from "@/components/ui/scroll-area";

import { currentAuthUser } from "@/helpers/auth.helper";
import { Channel as ChannelInterface } from "@/interface";
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

  return (
    <div className="h-full">
      <ChatHeader
        serverId={serverId}
        name={channel.name}
        type="channel"
        isPrivate={channel?.category?.private ?? false}
      />
      <ScrollArea className="h-[calc(100vh-12rem)] sm:h-[calc(100vh-11.3rem)] px-4 pt-3">
        {JSON.stringify(channel, null, 2)}
        {JSON.stringify(channel, null, 2)}
        {JSON.stringify(channel, null, 2)}
        {JSON.stringify(channel, null, 2)}
        {JSON.stringify(channel, null, 2)}
        {JSON.stringify(channel, null, 2)}
        {JSON.stringify(channel, null, 2)}
        {JSON.stringify(channel, null, 2)}
        {JSON.stringify(channel, null, 2)}
        {JSON.stringify(channel, null, 2)}
        {JSON.stringify(channel, null, 2)}
        {JSON.stringify(channel, null, 2)}
      </ScrollArea>
      <ChatInput
        apiUrl={`/api/messages`}
        query={{
          channelId,
          serverId
        }}
        name={channel.name}
        type="channel"
      />
    </div>
  );
}
