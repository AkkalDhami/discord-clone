import { ChatInput } from "@/components/chat/chat-input";
import { ChatHeader } from "@/components/layouts/chat-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { currentAuthUser } from "@/helpers/auth.helper";
import { Member as MemberIterface } from "@/interface";
import { getOrCreateConversation } from "@/lib/conversation";
import Member from "@/models/member.model";
import { Types } from "mongoose";
import { redirect } from "next/navigation";

export default async function Page(
  props: PageProps<"/servers/[serverId]/conversations/[memberId]">
) {
  const profile = await currentAuthUser();

  if (!profile) {
    return redirect("/signin");
  }

  const { params } = props;
  const { serverId, memberId } = await params;

  const [member] = (await Member.aggregate([
    {
      $match: {
        _id: new Types.ObjectId(memberId),
        serverId: new Types.ObjectId(serverId)
      }
    },
    {
      $lookup: {
        from: "profiles",
        localField: "profileId",
        foreignField: "_id",
        as: "profile",
        pipeline: [
          {
            $project: {
              name: 1,
              avatar: 1,
              email: 1,
              username: 1,
              _id: 1
            }
          }
        ]
      }
    },
    {
      $unwind: "$profile"
    }
  ])) as MemberIterface[];

  // console.log({ member: member.profile });

  if (!member) {
    return redirect("/");
  }

  const conversation = await getOrCreateConversation({
    memberOneId: member._id.toString(),
    memberTwoId: profile.id.toString(),
    serverId,
    type: "direct"
  });

  if (!conversation) {
    return redirect(`/servers/${serverId}`);
  }

  console.log({ conversation });

  return (
    <div className="h-full border-b border-edge pb-2.5">
      <ChatHeader
        serverId={serverId}
        name={member.profile.name}
        type="member"
        imageUrl={member.profile?.avatar?.url}
        isPrivate={false}
      />
      <ScrollArea className="h-[calc(100vh-12rem)] px-4 pt-3 sm:h-[calc(100vh-11.3rem)]">
        {JSON.stringify(member, null, 2)}
        {JSON.stringify(member, null, 2)}
        {JSON.stringify(member, null, 2)}
        {JSON.stringify(member, null, 2)}
        {JSON.stringify(member, null, 2)}
      </ScrollArea>
      <ChatInput
        apiUrl={`/api/messages`}
        query={{
          memberId,
          serverId
        }}
        name={member.profile.username}
        type="member"
      />
    </div>
  );
}
