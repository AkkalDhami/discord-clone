"use client";

import { ActionTooltip } from "@/components/common/action-tooltip";
import {
  IconPhoneCall,
  IconPin,
  IconUserCircle,
  IconUsersPlus,
  IconVideo
} from "@tabler/icons-react";
import { ChatHeaderType } from "@/components/layouts/chat-header";
import { SidebarProfileData, useModal } from "@/hooks/use-modal-store";

export function ChatHeaderAction({
  type,
  sidebarProfile
}: {
  type: ChatHeaderType;
  sidebarProfile?: SidebarProfileData;
}) {
  const { open, isOpen, close, type: modalType } = useModal();
  const isSidebarOpen = isOpen && modalType === "profile-sidebar";

  return (
    <div className="flex items-center gap-3">
      {type === "friend" && (
        <>
          <ActionTooltip label="Start Voice Call" side="bottom">
            <IconPhoneCall className="text-muted-foreground hover:text-accent-foreground size-7 cursor-pointer p-1" />
          </ActionTooltip>
          <ActionTooltip label="Start Video Call" side="bottom">
            <IconVideo className="text-muted-foreground hover:text-accent-foreground size-7 cursor-pointer p-1" />
          </ActionTooltip>
          <ActionTooltip label="Add Friends to DM" side="bottom">
            <IconUsersPlus className="text-muted-foreground hover:text-accent-foreground size-7 cursor-pointer p-1" />
          </ActionTooltip>
        </>
      )}
      <ActionTooltip label="Pin Messages" side="bottom">
        <IconPin className="text-muted-foreground hover:text-accent-foreground size-7 cursor-pointer p-1" />
      </ActionTooltip>

      {type === "friend" && (
        <ActionTooltip
          label={isSidebarOpen ? "Hide User Profile" : "Show User Profile"}
          side="bottom">
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
        </ActionTooltip>
      )}
    </div>
  );
}
