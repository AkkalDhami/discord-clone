"use client";

import { IconHash, IconLockFilled } from "@tabler/icons-react";
import { UserAvatar } from "@/components/common/user-avatar";
import { ChatHeaderAction } from "@/components/chat/chat-header-action";
import { cn } from "@/lib/utils";
import { SidebarProfileData, useModal } from "@/hooks/use-modal-store";
import { GroupChatLogo } from "@/components/chat/chat-item";
import { PopulatedConversation } from "@/components/chat/direct-chat-section";
import { ActionTooltip } from "@/components/common/action-tooltip";

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
  const { isOpen, type: modalType, open } = useModal();
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
        "border-edge mt-4 flex items-center justify-between border-y px-4 pt-3 pb-3",
        isSidebarOpen && "lg:pr-84",
        type === "group" && "pt-1.5 pb-1.5"
      )}>
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
          <ActionTooltip label="Edit group" side="bottom">
            <div
              onClick={() =>
                open("edit-group", {
                  conversation
                })
              }
              className="hover:bg-secondary flex cursor-pointer items-center rounded-lg px-2 py-0.5">
              <GroupChatLogo conversation={conversation} className="size-6" />
              <div className="ml-1 flex flex-col items-start sm:ml-4">
                <h3 className="text-sm font-medium">{displayName}</h3>
                <p className="text-muted-foreground hidden text-xs sm:flex">
                  {conversation?.participants.length} Members
                </p>
              </div>
            </div>
          </ActionTooltip>
        )}

        {type !== "group" && (
          <span className="text-base font-normal">{name}</span>
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
