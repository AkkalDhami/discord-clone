import { ScrollArea } from "@/components/ui/scroll-area";
import { DirectChatSection } from "@/components/chat/direct-chat-section";

import { DirectChatItemSection } from "@/components/chat/direct-chat-item-section";
import { DirectChatSidebarHeader } from "@/components/layouts/direct-chat-sidebar-header";
import dbConnect from "@/configs/db";
import Friendship from "@/models/friendship.model";
import { PartialProfile, PopulatedFriendship } from "@/types/friend";
import { currentAuthUser } from "@/helpers/auth.helper";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export async function DirectChatSidebar() {
  await dbConnect();

  const currentUser = await currentAuthUser();

  if (!currentAuthUser) {
    return redirect("/");
  }

  const friends = (await Friendship.find({
    user: currentUser?.id,
    status: "active"
  })
    .populate("friend", "username email name _id avatar")
    .populate("user", "username email name _id avatar")
    .lean()) as unknown as PopulatedFriendship[];

  const mappedFriends: PartialProfile[] = friends.map(f => ({
    _id: f.friend._id,
    email: f.friend.email,
    username: f.friend.username,
    name: f.friend.name,
    avatar: f.friend.avatar
  }));

  return (
    <div className="text-primary border-edge bg-background mb-4 flex h-full w-full flex-col border-b pt-12.75 pb-4 md:pt-0">
      <DirectChatSidebarHeader />
      <DirectChatItemSection />
      <ScrollArea className={"h-[calc(100vh-120px)] pb-4"}>
        <DirectChatSection friend={JSON.stringify(mappedFriends)} />
      </ScrollArea>
    </div>
  );
}
