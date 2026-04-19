"use client";

import { IconPlus } from "@tabler/icons-react";
import { ActionTooltip } from "@/components/common/action-tooltip";
import { useModal } from "@/hooks/use-modal-store";

export function DirectChatSection() {
  const { open } = useModal();
  return (
    <div className="px-2 py-3">
      <div className="flex items-center justify-between">
        <h3 className="text-muted-foreground hover:text-accent-foreground text-sm">
          Direct Chats
        </h3>
        <ActionTooltip label="Create Chat" side="top" size="sm" align="center">
          <IconPlus
            onClick={() => open("new-chat")}
            className="text-muted-foreground hover:text-accent-foreground size-5 cursor-pointer p-0.5"
          />
        </ActionTooltip>
      </div>
    </div>
  );
}
