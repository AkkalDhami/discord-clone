"use client";

import { ActionTooltip } from "@/components/common/action-tooltip";
import {
  IconPhoneCall,
  IconPin,
  IconPencil,
  IconUserCircle,
  IconUsers,
  IconUsersPlus,
  IconVideo
} from "@tabler/icons-react";
import { ChatHeaderType } from "@/components/layouts/chat-header";
import { SidebarProfileData, useModal } from "@/hooks/use-modal-store";

export function ChatHeaderAction({
  type,
  sidebarProfile,
  conversation
}: {
  type: ChatHeaderType;
  sidebarProfile?: SidebarProfileData;
  conversation?: {
    _id: string;
    name?: string;
    type?: string;
  };
}) {
  const { open, isOpen, close, type: modalType } = useModal();
  const isSidebarOpen = isOpen && modalType === "profile-sidebar";

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
          <ActionTooltip
            label={type === "group" ? "Add members" : "Add Friends to DM"}
            side="bottom">
            <IconUsersPlus
              onClick={() =>
                type === "group" && conversation?._id
                  ? open("add-group-members", { conversation })
                  : undefined
              }
              className="text-muted-foreground hover:text-accent-foreground size-7 cursor-pointer p-1"
            />
          </ActionTooltip>
          {type === "group" && conversation?._id && (
            <ActionTooltip label="Edit group" side="bottom">
              <IconPencil
                onClick={() => open("edit-group", { conversation })}
                className="text-muted-foreground hover:text-accent-foreground size-7 cursor-pointer p-1"
              />
            </ActionTooltip>
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
