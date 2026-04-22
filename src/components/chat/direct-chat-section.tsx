"use client";

import { IconPlus } from "@tabler/icons-react";
import { ActionTooltip } from "@/components/common/action-tooltip";
import { useModal } from "@/hooks/use-modal-store";
import { PartialProfile } from "@/types/friend";

export function DirectChatSection({ friend }: { friend: string }) {
  const friends = JSON.parse(friend) as PartialProfile[];
  const { open } = useModal();
  return (
    <div className="py-3">
      <div className="border-edge border-b pb-3">
        <div className="flex items-center justify-between px-6">
          <h3 className="text-muted-foreground hover:text-accent-foreground text-sm">
            Direct Chats
          </h3>
          <ActionTooltip
            label="Create Chat"
            side="top"
            size="sm"
            align="center">
            <IconPlus
              onClick={() =>
                open("new-chat", {
                  friends
                })
              }
              className="text-muted-foreground hover:text-accent-foreground size-5 cursor-pointer p-0.5"
            />
          </ActionTooltip>
        </div>
      </div>
    </div>
  );
}
