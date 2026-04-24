"use client";

import { ActionTooltip } from "@/components/common/action-tooltip";
import { cn } from "@/lib/utils";
import { IconMessageCircleFilled } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function DirectChatAction() {
  const pathname = usePathname();
  return (
    <ActionTooltip label="Direct Chats" side="right" align="center">
      <Link href={"/friends"} className="group relative cursor-pointer">
        <div
          className={cn(
            "bg-primary absolute top-1/2 -left-8.5 w-1 -translate-y-1/2 rounded-r-full transition-all",
            !(
              pathname.includes("/friends") ||
              pathname.includes("/conversations")
            ) && "group-hover:h-5",
            (pathname.includes("/friends") ||
              pathname.includes("/conversations")) &&
              "h-9"
          )}
        />
        <div
          className={cn(
            "bg-secondary group-hover:bg-primary-500 dark:group-hover:bg-primary-500 flex size-10 items-center justify-center rounded-xl transition-all sm:size-10",
            (pathname.includes("/friends") ||
              pathname.includes("/conversations")) &&
              "bg-primary-500 text-white"
          )}>
          <IconMessageCircleFilled className="size-6" />
        </div>
      </Link>
    </ActionTooltip>
  );
}
