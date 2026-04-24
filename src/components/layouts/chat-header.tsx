"use client";

import { IconHash, IconLockFilled } from "@tabler/icons-react";
import { UserAvatar } from "@/components/common/user-avatar";
import { ChatHeaderAction } from "@/components/chat/chat-header-action";
import { cn } from "@/lib/utils";
import { SidebarProfileData, useModal } from "@/hooks/use-modal-store";
import { GroupChatLogo } from "@/components/chat/chat-item";
import { PopulatedConversation } from "@/components/chat/direct-chat-section";

export type ChatHeaderType = "channel" | "member" | "friend" | "group";

type ChatHeaderProps = {
  serverId?: string;
  name: string;
  type: ChatHeaderType;
  imageUrl?: string;
  isPrivate?: boolean;
  sidebarProfile?: SidebarProfileData;
  conversation?: PopulatedConversation;
};

export function ChatHeader({
  name,
  type,
  imageUrl,
  isPrivate = false,
  sidebarProfile,
  conversation
}: ChatHeaderProps) {
  const { isOpen, type: modalType } = useModal();
  const isSidebarOpen = isOpen && modalType === "profile-sidebar";

  const displayName = conversation?.name
    ? conversation.name
    : "@" +
      conversation?.participants
        ?.slice(0, 2)
        ?.map(member => member.username)
        .join(", @") +
      "...";

  return (
    <div
      className={cn(
        "border-edge mt-3.75 flex items-center justify-between border-y px-4 pt-3 pb-3",
        isSidebarOpen && "pr-84"
      )}>
      {/* <div className="border-edge fixed top-6 z-10 flex w-[calc(100vw-20rem)] items-center border-y bg-neutral-100 px-4 py-3 pr-110 dark:bg-neutral-950"> */}
      <div className="relative flex items-center gap-2 px-8 md:px-0">
        {type === "channel" && (
          <>
            <IconHash className="text-muted-foreground size-5" />
            {isPrivate && (
              <IconLockFilled
                className={
                  "bg-background text-muted-foreground absolute top-0 left-3 z-1 size-3"
                }
              />
            )}
          </>
        )}
        {(type === "member" || type === "friend") && (
          <UserAvatar name={name} src={imageUrl} className="size-6" />
        )}
        {type === "group" && conversation && (
          <div className="flex items-center">
            <GroupChatLogo conversation={conversation} className="size-6" />
            <div className="ml-0">
              <h3 className="line-clamp-1 text-sm font-medium">
                {displayName}
              </h3>
              <p className="text-muted-foreground text-xs">
                {conversation?.participants.length} Members
              </p>
            </div>
          </div>
        )}
      </div>

      <ChatHeaderAction
        type={type}
        sidebarProfile={sidebarProfile}
        conversation={conversation}
      />
    </div>
  );
}
