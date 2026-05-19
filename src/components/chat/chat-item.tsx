"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { OnlineUserAvatar, UserAvatar } from "@/components/common/user-avatar";
import { PopulatedConversation } from "@/components/chat/direct-chat-section";
import { IconX } from "@tabler/icons-react";
import { useModal } from "@/hooks/use-modal-store";
import { removeLeadingEmoji } from "@/utils/remove-leading-emoji";
import { useUser } from "@/hooks/use-user-store";
import { getDateTime } from "@/utils/date";
import { TypingUser, useTyping } from "@/hooks/use-typing-store";
import { useSocket } from "@/hooks/use-socket-store";
import { BouncingDots } from "@/components/ui/bouncing-dots";
import { splitContent } from "@/utils/split-content";

export function GroupChatItem({ c }: { c: PopulatedConversation }) {
  const params = useParams();

  const { open } = useModal();

  const participants = c?.participants ?? [];

  if (c.type !== "group" || participants.length === 0) {
    return null;
  }

  const displayName = c?.name
    ? splitContent(c.name)
    : "@" +
      splitContent(participants.map(member => member.username).join(", @"));

  return (
    <div
      key={c._id}
      className={cn(
        "hover:bg-secondary group relative flex w-full items-center justify-between rounded-md p-2",
        params.friendId === c._id && "bg-secondary"
      )}>
      <Link href={`/conversations/${c._id}`} className="w-full flex-1">
        <div className="relative flex items-center gap-2">
          <GroupChatLogo conversation={c} />

          <div className="ml-2">
            <h3 className="line-clamp-1 text-sm font-medium">{displayName}</h3>
            <p className="text-muted-foreground text-xs">
              {participants.length} Members
            </p>
          </div>
        </div>
      </Link>
      <IconX
        onClick={() => {
          open("leave-group", {
            conversation: c
          });
        }}
        className="text-muted-foreground hover:text-accent-foreground size-6 cursor-pointer p-1 opacity-0 group-hover:opacity-100"
      />
    </div>
  );
}

export function GroupChatLogo({
  conversation,
  className
}: {
  conversation: PopulatedConversation;
  className?: string;
}) {
  return conversation?.logo?.url ? (
    <UserAvatar
      src={conversation?.logo?.url}
      name={removeLeadingEmoji(conversation?.name || "")}
      className={cn("size-8", className)}
    />
  ) : (
    <>
      <UserAvatar
        name={removeLeadingEmoji(conversation?.name || "")}
        className={cn("size-8 sm:hidden", className)}
      />

      <div className="relative hidden h-8 w-7 sm:block">
        {conversation?.participants?.slice(0, 3).map((participant, index) => (
          <UserAvatar
            key={participant._id}
            src={participant?.avatar?.url}
            name={participant?.name}
            className={cn(
              "border-background absolute size-7 border-2",
              index === 0 && "top-2 -left-1 z-10",
              index === 1 && "-top-1 left-3 z-20",
              index === 2 && "top-3 left-3 z-30",
              className
            )}
          />
        ))}
      </div>
    </>
  );
}

export function FriendChatItem({ c }: { c: PopulatedConversation }) {
  const params = useParams();
  const { user } = useUser();
  const participant = c?.participants?.find(p => p._id !== user?.id);

  const onlineUsers = useSocket(state => state.onlineUsers);
  const isOnline = onlineUsers.includes(participant?._id || "");

  const EMPTY_TYPING_USERS: TypingUser[] = [];
  const typingUsers = useTyping(
    state => state.typingUsers[c._id ?? ""] ?? EMPTY_TYPING_USERS
  );

  const isTyping = typingUsers.find(
    t => t.userId === participant?._id && t.conversationId === c._id
  );

  if (c.type !== "direct" || !participant?._id) {
    return null;
  }

  return (
    <div className="">
      <Link
        href={`/conversations/${participant._id}`}
        className={cn(
          "hover:bg-secondary group relative flex w-full items-center rounded-md p-2",
          params.friendId === participant._id && "bg-secondary"
        )}>
        <OnlineUserAvatar
          src={participant?.avatar?.url}
          name={participant?.name}
          isOnline={isOnline}
          className="size-9"
        />
        <div className="ml-2 w-full">
          <div className="flex w-full items-center gap-3">
            <h3 className="line-clamp-1 text-sm font-medium">
              {splitContent(participant?.name, 15)}
            </h3>

            <p className="text-muted-foreground text-xs opacity-0 group-hover:opacity-100">
              @{participant?.username}
            </p>
          </div>
          {isTyping ? (
            <div className="mt-1 flex items-end gap-10 *:w-10">
              <BouncingDots className="text-[#f59e0b]" />
            </div>
          ) : (
            <div className="flex w-full items-center justify-between">
              {c.lastMessage?.content && (
                <p className="text-muted-foreground text-xs">
                  {user?.id === c.lastMessage.sender
                    ? `You: ${splitContent(c.lastMessage?.content)}`
                    : splitContent(c.lastMessage?.content)}
                </p>
              )}
              {c.lastMessage?.createdAt && (
                <p className="text-muted-foreground text-xs">
                  {getDateTime({ date: c.lastMessage.createdAt })}
                </p>
              )}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
