import { IconPlus } from "@tabler/icons-react";
import { ActionTooltip } from "@/components/common/action-tooltip";

export function DirectChatSection() {
  return (
    <div className="px-2 py-3">
      <div className="flex items-center justify-between">
        <h3 className="text-muted-foreground hover:text-accent-foreground text-sm">
          Direct Messages
        </h3>
        <ActionTooltip
          label="Create Message"
          side="top"
          size="sm"
          align="center">
          <IconPlus className="text-muted-foreground hover:text-accent-foreground size-5 cursor-pointer p-0.5" />
        </ActionTooltip>
      </div>
    </div>
  );
}
