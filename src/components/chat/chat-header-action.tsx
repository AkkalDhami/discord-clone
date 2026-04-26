"use client";

import { ActionTooltip } from "@/components/common/action-tooltip";
import {
  IconPhoneCall,
  IconPin,
  IconPencil,
  IconUserCircle,
  IconUsers,
  IconUsersPlus,
  IconVideo,
  IconHammer
} from "@tabler/icons-react";
import { ChatHeaderType } from "@/components/layouts/chat-header";
import { SidebarProfileData, useModal } from "@/hooks/use-modal-store";
import { PartialProfile } from "@/types/friend";
import { useUser } from "@/hooks/use-user-store";

export function ChatHeaderAction({
  type,
  sidebarProfile,
  conversation
}: {
  type: ChatHeaderType;
  sidebarProfile?: SidebarProfileData;
  conversation?: {
    _id: string;
    participants: PartialProfile[];
    admin: string;
  };
}) {
  const { open, isOpen, close, type: modalType } = useModal();
  const isSidebarOpen = isOpen && modalType === "profile-sidebar";

  const { user } = useUser();
  const isGroupAdmin = user?.id && conversation?.admin === user.id;

  return (
    <div className="flex items-center gap-3">
      {(type === "friend" || type === "group") && (
        <>
          <ActionTooltip label="Start Voice Call" side="bottom">
            <IconPhoneCall className="text-muted-foreground hover:text-accent-foreground size-7 cursor-pointer p-1" />
          </ActionTooltip>
          <ActionTooltip label="Start Video Call" side="bottom">
            <IconVideo className="text-muted-foreground hover:text-accent-foreground size-7 cursor-pointer p-1" />
          </ActionTooltip>
          {type === "group" && conversation?._id && (
            <>
              <ActionTooltip label={"Invite Friends"} side="bottom">
                <IconUsersPlus
                  onClick={() => open("add-group-members", { conversation })}
                  className="text-muted-foreground hover:text-accent-foreground size-7 cursor-pointer p-1"
                />
              </ActionTooltip>
              <ActionTooltip label="Edit group" side="bottom">
                <IconPencil
                  onClick={() => open("edit-group", { conversation })}
                  className="text-muted-foreground hover:text-accent-foreground size-7 cursor-pointer p-1"
                />
              </ActionTooltip>
              {isGroupAdmin && (
                <ActionTooltip label="Kick Members" side="bottom">
                  <IconHammer
                    onClick={() => open("kick-group-members", { conversation })}
                    className="text-muted-foreground hover:text-accent-foreground size-7 cursor-pointer p-1"
                  />
                </ActionTooltip>
              )}
            </>
          )}
        </>
      )}
      <ActionTooltip label="Pin Messages" side="bottom">
        <IconPin className="text-muted-foreground hover:text-accent-foreground size-7 cursor-pointer p-1" />
      </ActionTooltip>

      {(type === "friend" || type === "group") && (
        <ActionTooltip
          label={
            isSidebarOpen
              ? type === "friend"
                ? "Hide User Profile"
                : "Hide Member List"
              : type === "friend"
                ? "Show User Profile"
                : "Show Member List"
          }
          side="bottom">
          {type === "friend" ? (
            <IconUserCircle
              onClick={() => {
                if (!isSidebarOpen) {
                  open("profile-sidebar", {
                    sidebarProfile: sidebarProfile
                  });
                } else {
                  close();
                }
              }}
              className="text-muted-foreground hover:text-accent-foreground size-7 cursor-pointer p-1"
            />
          ) : (
            <IconUsers
              onClick={() => {
                if (!isSidebarOpen) {
                  open("profile-sidebar", {
                    sidebarProfile: sidebarProfile
                  });
                } else {
                  close();
                }
              }}
              className="text-muted-foreground hover:text-accent-foreground size-7 cursor-pointer p-1"
            />
          )}
        </ActionTooltip>
      )}
    </div>
  );
}
