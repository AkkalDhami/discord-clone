import { ScrollArea } from "@/components/ui/scroll-area";
import { DirectChatSection } from "@/components/chat/direct-chat-section";

import { DirectChatItemSection } from "@/components/chat/direct-chat-item-section";
import { DirectChatSidebarHeader } from "@/components/layouts/direct-chat-sidebar-header";
import dbConnect from "@/configs/db";
import Friendship from "@/models/friendship.model";
import { PartialProfile, PopulatedFriendship } from "@/types/friend";
import { currentAuthUser } from "@/helpers/auth.helper";
import { redirect } from "next/navigation";
import Conversation from "@/models/conversation.model";
import { Types } from "mongoose";

export const dynamic = "force-dynamic";

export async function DirectChatSidebar() {
  await dbConnect();

  const currentUser = await currentAuthUser();

  if (!currentAuthUser) {
    return redirect("/signin");
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

  const conversations = await Conversation.aggregate([
    {
      $match: {
        participants: new Types.ObjectId(currentUser?.id)
      }
    },
    {
      $lookup: {
        from: "profiles",
        let: { participantIds: "$participants" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $in: ["$_id", "$$participantIds"]
                  }
                ]
              }
            }
          },
          {
            $project: {
              _id: 1,
              name: 1,
              email: 1,
              username: 1,
              avatar: 1
            }
          }
        ],
        as: "participants"
      }
    },
    {
      $lookup: {
        from: "messages",
        localField: "lastMessage",
        foreignField: "_id",
        pipeline: [
          {
            $match: {
              deleted: false
            }
          },
          {
            $project: {
              _id: 1,
              content: 1,
              sender: 1,
              type: 1
            }
          }
        ],
        as: "lastMessage"
      }
    },

    {
      $unwind: {
        path: "$lastMessage",
        preserveNullAndEmptyArrays: true
      }
    },

    {
      $sort: { updatedAt: -1 }
    }
  ]);

  // console.log({ conversations });

  return (
    <div className="text-primary border-edge flex h-full w-full flex-col border-x pt-8.5 md:border-x-0 md:pt-0">
      <DirectChatSidebarHeader />
      <DirectChatItemSection />
      <ScrollArea
        className={"border-edge mb-4 h-[calc(100vh-120px)] border-b pb-4"}>
        <DirectChatSection
          friend={JSON.stringify(mappedFriends)}
          conversations={JSON.stringify(conversations)}
          user={JSON.stringify({
            _id: currentUser?.id as string,
            name: currentUser?.name as string,
            username: currentUser?.username as string,
            email: currentUser?.email as string,
            avatar: currentUser?.avatar
          })}
        />
      </ScrollArea>
    </div>
  );
}
