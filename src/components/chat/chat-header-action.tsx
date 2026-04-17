import { ActionTooltip } from "@/components/common/action-tooltip";
import {
  IconPhoneCallFilled,
  IconPinFilled,
  IconUsersPlus,
  IconVideoFilled
} from "@tabler/icons-react";
import { ChatHeaderType } from "@/components/layouts/chat-header";

export function ChatHeaderAction({ type }: { type: ChatHeaderType }) {
  return (
    <div className="flex items-center gap-3">
      {type === "friend" && (
        <>
          <ActionTooltip label="Start Voice Call" side="bottom">
            <IconPhoneCallFilled className="text-muted-foreground hover:text-accent-foreground size-7 cursor-pointer p-1" />
          </ActionTooltip>
          <ActionTooltip label="Start Video Call" side="bottom">
            <IconVideoFilled className="text-muted-foreground hover:text-accent-foreground size-7 cursor-pointer p-1" />
          </ActionTooltip>
          <ActionTooltip label="Add Friends to DM" side="bottom">
            <IconUsersPlus className="text-muted-foreground hover:text-accent-foreground size-7 cursor-pointer p-1" />
          </ActionTooltip>
        </>
      )}
      <ActionTooltip label="Pin Messages" side="bottom">
        <IconPinFilled className="text-muted-foreground hover:text-accent-foreground size-7 cursor-pointer p-1" />
      </ActionTooltip>
    </div>
  );
}
