import {
  BlockedUserChatInput,
  ChatInput
} from "@/app/api/servers/chat/chat-input";
import {
  DirectChatWelcome,
  GroupChatWelcome
} from "@/app/api/servers/chat/chat-welcome";
import { ChatHeader } from "@/components/layouts/chat-header";
import { MessagesSection } from "@/components/messages/message-section";
import { ScrollArea } from "@/components/ui/scroll-area";
import dbConnect from "@/configs/db";
import { currentAuthUser } from "@/helpers/auth.helper";
import { FriendType } from "@/hooks/use-modal-store";
import { IFile, Server } from "@/interface";
import {
  getFriendConversation,
  getOrCreateFriendConversation
} from "@/lib/conversation";
import Conversation, { ConversationTypes } from "@/models/conversation.model";
import Friendship from "@/models/friendship.model";

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
  })
    .select("_id name email username avatar createdAt")
    .lean();

  const friendship = await Friendship.findOne({
    user: currentUser.id,
    friend: friendId
  }).lean();

  const conversationInDb = await Conversation.findOne({
    _id: friendId,
    deleted: false
  }).lean();

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

  const RawMutualFriends = await Friendship.aggregate([
    {
      $match: {
        status: "active",
        user: new Types.ObjectId(currentUser.id)
      }
    },
    {
      $lookup: {
        from: "friendships",
        let: { myFriendId: "$friend" },
        pipeline: [
          {
            $match: {
              status: "active",
              user: new Types.ObjectId(friendId),
              $expr: { $eq: ["$friend", "$$myFriendId"] }
            }
          }
        ],
        as: "mutual"
      }
    },
    {
      $match: {
        mutual: { $ne: [] }
      }
    },
    {
      $lookup: {
        from: "profiles",
        localField: "friend",
        foreignField: "_id",
        as: "profile"
      }
    },
    { $unwind: "$profile" },
    {
      $project: {
        _id: "$profile._id",
        name: "$profile.name",
        username: "$profile.username",
        email: "$profile.email",
        avatar: "$profile.avatar"
      }
    }
  ]);

  const mutualFriends = JSON.parse(
    JSON.stringify(RawMutualFriends)
  ) as PartialProfile[];

  const isDirectChat = !!friend;
  let directConversation = null;
  let rawGroupConversation = null;
  let conversationId = null;

  if (isDirectChat && currentUser.id !== friendId) {
    directConversation = await getOrCreateFriendConversation({
      admin: currentUser.id,
      participants: [currentUser.id, friend!._id.toString()],
      type: "direct"
    });
    conversationId = directConversation?._id?.toString();
  } else {
    rawGroupConversation = await getFriendConversation({
      cId: conversationInDb?._id?.toString(),
      participants: [currentUser.id],
      type: "group"
    });
    conversationId = rawGroupConversation?.conversation?._id?.toString();
  }

  if (!directConversation?._id && !rawGroupConversation?.conversation) {
    return redirect("/friends/all");
  }

  const { conversation: groupConversation, users: groupUsers } =
    rawGroupConversation || {};

  const mappedUsersName =
    groupUsers
      ?.filter(p => p._id.toString() !== currentUser.id)
      .map(p => p.name)
      .join(", ") || "";

  const isParticipant = groupUsers?.some(
    p => p._id.toString() === currentUser.id
  );

  if (!isParticipant && !isDirectChat) {
    return redirect("/friends");
  }

  const mappedMutualServers = mutualServers.map(s => {
    return {
      _id: s._id.toString(),
      name: s.name,
      inviteCode: s.inviteCode,
      logo: s.logo
    };
  });

  const parsedFriend = JSON.parse(
    JSON.stringify({
      ...friend,
      _id: friend?._id?.toString(),
      avatar: friend?.avatar ?? {
        public_id: "",
        size: 0,
        url: ""
      },
      memberSince: friend?.createdAt.toDateString()
    })
  ) as FriendType;

  // console.log({ parsedFriend });

  // console.log({
  //   directConversation,
  //   groupConversation
  // });

  const filteredParticipants = groupUsers
    ?.filter(p => p._id.toString() !== currentUser.id)
    .map(p => ({
      _id: p._id.toString(),
      name: p.name,
      username: p.username,
      email: p.email,
      avatar: { ...p.avatar }
    }));

  return (
    <div className="border-edge h-full border-b pb-2.5">
      <ChatHeader
        name={
          isDirectChat
            ? friend!.name
            : (groupConversation?.name ?? mappedUsersName)
        }
        type={isDirectChat ? "friend" : "group"}
        imageUrl={isDirectChat ? friend?.avatar?.url : undefined}
        conversation={{
          _id: (isDirectChat
            ? directConversation?._id
            : groupConversation?._id?.toString()) as string,

          name: isDirectChat ? friend?.name : groupConversation?.name,
          logo: isDirectChat ? undefined : { ...groupConversation?.logo },

          participants: isDirectChat
            ? (directConversation?.participants ?? [])
            : (groupUsers?.map(p => ({
                _id: p._id.toString(),
                email: p.email,
                name: p.name,
                username: p.username,
                avatar: { ...p.avatar }
              })) as unknown as PartialProfile[]),

          admin: isDirectChat
            ? (directConversation?.admin?.toString() as string)
            : (groupConversation?.admin.toString() as string),

          type: isDirectChat ? "direct" : "group"
        }}
        sidebarProfile={{
          type: isDirectChat ? "direct" : "group",

          servers: servers.map(s => ({
            _id: s._id.toString(),
            inviteCode: s.inviteCode,
            logo: s.logo,
            name: s.name
          })),

          friend: parsedFriend,

          mutualFriends: mutualFriends,
          mutualServers: mappedMutualServers,

          members: !isDirectChat
            ? groupUsers?.map(u => ({
                _id: u._id.toString(),
                name: u.name,
                username: u.username,
                email: u.email,
                avatar: { ...u.avatar }
              }))
            : [],

          adminId: !isDirectChat
            ? groupConversation?.admin.toString()
            : undefined
        }}
      />

      <ScrollArea className="h-[calc(100vh-12rem)] pt-3 sm:h-[calc(100vh-11.1rem)]">
        {groupConversation?.type !== "direct" && friend && friendship ? (
          <DirectChatWelcome
            friend={{
              _id: friend?._id?.toString(),
              email: friend?.email,
              name: friend?.name,
              username: friend?.username,
              avatar: { ...friend?.avatar }
            }}
            friendship={{
              _id: friendship?._id.toString() as string,
              blockedBy: friendship?.blockedBy?.toString() as string,
              status: friendship?.status as "active" | "blocked"
            }}
          />
        ) : (
          <GroupChatWelcome
            conversation={{
              _id: groupConversation?._id?.toString() as string,
              name: groupConversation?.name,
              logo: { ...groupConversation?.logo },
              participants: groupUsers?.map(p => ({
                _id: p._id.toString(),
                email: p.email,
                name: p.name,
                username: p.username,
                avatar: { ...p.avatar }
              })) as unknown as PartialProfile[],

              admin: groupConversation?.admin.toString() as string,
              type: groupConversation?.type as ConversationTypes
            }}
          />
        )}

        <MessagesSection conversationId={conversationId as string} />
      </ScrollArea>

      {friendship?.status === "blocked" ? (
        friend && <BlockedUserChatInput />
      ) : (
        <ChatInput
          query={{
            friendId: friend?._id?.toString(),
            conversationId:
              groupConversation?._id?.toString() ??
              directConversation?._id?.toString(),
            participants: filteredParticipants
          }}
          name={friend?.username ?? groupConversation?.name ?? mappedUsersName}
          type={
            !friend && groupConversation?.type === "group" ? "group" : "member"
          }
        />
      )}
    </div>
  );
}
