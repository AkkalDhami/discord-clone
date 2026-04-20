"use client";

import { IconUserPlus, IconUsers } from "@tabler/icons-react";
import { ActionTooltip } from "@/components/common/action-tooltip";
import { useModal } from "@/hooks/use-modal-store";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { PartialProfile } from "@/types/friend";

export function DirectChatItemSection() {
  const { open } = useModal();
  const pathname = usePathname();
  return (
    <div className="border-edge flex gap-2 border-b px-2 py-2">
      <Link
        href={"/friends"}
        className={cn(
          "text-muted-foreground hover:bg-secondary flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-1.5",
          pathname.includes("/friends") && "bg-secondary text-accent-foreground"
        )}>
        <div className="flex items-center gap-1">
          <IconUsers className="size-4" />
          Friends
        </div>
        <ActionTooltip label="Add Friend" side="top" size="sm" align="center">
          <IconUserPlus
            className="text-muted-foreground hover:text-accent-foreground size-6 cursor-pointer p-0.5"
            onClick={() => open("add-friend")}
          />
        </ActionTooltip>
      </Link>
    </div>
  );
}
