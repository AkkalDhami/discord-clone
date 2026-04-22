import { ChatInput } from "@/components/chat/chat-input";
import { ChatHeader } from "@/components/layouts/chat-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import dbConnect from "@/configs/db";
import { currentAuthUser } from "@/helpers/auth.helper";
import Profile from "@/models/profile.model";
import { redirect } from "next/navigation";

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

  console.log({
    friend
  });

  if (!friend) {
    return redirect("/friends/all");
  }

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
