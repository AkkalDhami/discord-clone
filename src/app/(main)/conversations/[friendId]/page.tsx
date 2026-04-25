import { ChatInput } from "@/components/chat/chat-input";
import { ChatHeader } from "@/components/layouts/chat-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import dbConnect from "@/configs/db";
import { currentAuthUser } from "@/helpers/auth.helper";
import { IFile, Server } from "@/interface";
import {
  getFriendConversation,
  getOrCreateFriendConversation
} from "@/lib/conversation";
import Conversation, { ConversationTypes } from "@/models/conversation.model";
import Member from "@/models/member.model";
import Profile from "@/models/profile.model";
import { PartialProfile } from "@/types/friend";
import { Types } from "mongoose";
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

  const conversationInDb = await Conversation.findOne({
    _id: friendId
  });

  if (!friend && !conversationInDb) {
    return redirect("/friends/all");
  }

  const servers = await Member.aggregate([
    {
      $match: {
        profileId: new Types.ObjectId(currentUser.id)
      }
    },
    {
      $lookup: {
        from: "servers",
        localField: "serverId",
        foreignField: "_id",
        as: "servers"
      }
    },
    {
      $unwind: "$servers"
    },
    {
      $replaceRoot: { newRoot: "$servers" }
    }
  ]);

  const mutualServers = (await Member.aggregate([
    {
      $match: {
        profileId: {
          $in: [
            new Types.ObjectId(currentUser.id),
            new Types.ObjectId(friendId)
          ]
        }
      }
    },
    {
      $group: {
        _id: "$serverId",
        users: { $addToSet: "$profileId" }
      }
    },
    {
      $match: {
        users: {
          $all: [
            new Types.ObjectId(currentUser.id),
            new Types.ObjectId(friendId)
          ]
        }
      }
    },
    {
      $lookup: {
        from: "servers",
        localField: "_id",
        foreignField: "_id",
        as: "server"
      }
    },
    { $unwind: "$server" },
    {
      $replaceRoot: { newRoot: "$server" }
    }
  ])) as unknown as Server[];

  console.log({ mutualServers });

  const conversation = await getOrCreateFriendConversation({
    cId: conversationInDb?._id?.toString(),
    admin: currentUser.id,
    participants: [currentUser.id, ...(friend?._id?.toString() ?? [])],
    type: "direct"
  });

  const rawGroupConversation = await getFriendConversation({
    cId: conversationInDb?._id?.toString(),
    participants: [currentUser.id],
    type: "group"
  });

  if (!conversation && !rawGroupConversation) {
    return redirect("/friends/all");
  }

  const { conversation: groupConversation, users: groupUsers } =
    rawGroupConversation || {};

  const mappedUsersName =
    groupUsers
      ?.filter(p => p._id.toString() !== currentUser.id)
      .map(p => p.name)
      .join(", ") || "";

  return (
    <div className="border-edge h-full border-b pb-2.5">
      <ChatHeader
        name={friend?.name ?? groupConversation?.name ?? mappedUsersName}
        type={
          !friend && groupConversation?.type === "group" ? "group" : "friend"
        }
        imageUrl={friend?.avatar?.url}
        conversation={{
          _id: groupConversation?._id?.toString() as string,
          name: groupConversation?.name,
          logo: groupConversation?.logo,
          participants: groupUsers?.map(p => ({
            _id: p._id.toString(),
            email: p.email,
            name: p.name,
            username: p.username,
            avatar: {
              ...p.avatar
            }
          })) as unknown as PartialProfile[],

          admin: groupConversation?.admin.toString() as string,
          type: groupConversation?.type as ConversationTypes
        }}
        sidebarProfile={{
          type: !friend && groupConversation ? "group" : "direct",
          servers:
            servers.length > 0
              ? servers?.map(s => ({
                  _id: s?._id?.toString(),
                  inviteCode: s?.inviteCode,
                  logo: s?.logo,
                  name: s?.name
                }))
              : [],
          friend: friend
            ? {
                _id: friend._id.toString(),
                name: friend.name,
                username: friend.username,
                email: friend.email,
                avatar: friend.avatar,
                memberSince: friend.createdAt.toDateString()
              }
            : undefined,
          mutualFriends: [],
          mutualServers: mutualServers || [],
          members:
            !friend &&
            groupConversation &&
            groupUsers?.map(u => ({
              _id: u._id.toString(),
              name: u.name,
              username: u.username,
              email: u.email,
              avatar: u.avatar
            }))
        }}
      />
      <ScrollArea className="h-[calc(100vh-12rem)] px-4 pt-3 sm:h-[calc(100vh-11.1rem)]"></ScrollArea>
      <ChatInput
        apiUrl={`/api/messages`}
        query={{
          friend
        }}
        name={friend?.username ?? groupConversation?.name ?? mappedUsersName}
        type={groupConversation?.type === "group" ? "group" : "member"}
      />
    </div>
  );
}
