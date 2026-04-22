import { ChatInput } from "@/components/chat/chat-input";
import { ChatHeader } from "@/components/layouts/chat-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import dbConnect from "@/configs/db";
import { currentAuthUser } from "@/helpers/auth.helper";
import { IFile } from "@/interface";
import { getOrCreateFriendConversation } from "@/lib/conversation";
import { ConversationTypes } from "@/models/conversation.model";
import Profile from "@/models/profile.model";
import { PartialProfile } from "@/types/friend";
import { redirect } from "next/navigation";

export type ConversationType = {
  _id: string;

  participants: PartialProfile[];
  admin: string;
  type: ConversationTypes;

  name?: string;
  logo?: IFile;
  lastMessage?: string;
};

export default async function Page(
  props: PageProps<"/conversations/[friendId]">
) {
  const currentUser = await currentAuthUser();

  if (!currentUser) {
    return redirect("/signin");
  }

  const { friendId } = await props.params;

  await dbConnect();

  const friend = await Profile.findOne({
    _id: friendId
  });

  // console.log({
  //   friend
  // });

  if (!friend) {
    return redirect("/friends/all");
  }

  const conversation = await getOrCreateFriendConversation({
    admin: currentUser.id,
    participants: [currentUser.id, friend._id.toString()],
    type: "direct"
  });

  if (!conversation) {
    return redirect("/friends/all");
  }

  console.log({ conversation });

  return (
    <div className="border-edge h-full border-b pb-2.5">
      <ChatHeader
        name={friend.name}
        type="friend"
        imageUrl={friend?.avatar?.url}
      />
      <ScrollArea className="h-[calc(100vh-12rem)] px-4 pt-3 sm:h-[calc(100vh-11.1rem)]"></ScrollArea>
      <ChatInput
        apiUrl={`/api/messages`}
        query={{
          friend
        }}
        name={friend.username}
        type="member"
      />
    </div>
  );
}
