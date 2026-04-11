import { ChatInput } from "@/components/chat/chat-input";
import { ChatHeader } from "@/components/layouts/chat-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { currentAuthUser } from "@/helpers/auth.helper";
import { Member as MemberIterface } from "@/interface";
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

  return (
    <div className="h-full bg-neutral-100 dark:bg-neutral-950">
      <ChatHeader
        serverId={serverId}
        name={member.profile.name}
        type="member"
        imageUrl={member.profile?.avatar?.url}
        isPrivate={false}
      />
      <ScrollArea className="h-[calc(100vh-10.8rem)] p-4 py-4">
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
