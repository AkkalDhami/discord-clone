"use client";

import { ActionTooltip } from "@/components/common/action-tooltip";
import { cn } from "@/lib/utils";
import { IconBrandDiscordFilled } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function DirectChatAction() {
  const pathname = usePathname();
  return (
    <ActionTooltip label="Direct Messages" side="right" align="center">
      <Link href={"/conversations"} className="group cursor-pointer">
        <div
          className={cn(
            "bg-secondary flex size-10 items-center justify-center rounded-xl transition-all group-hover:bg-primary-500 sm:size-10 dark:group-hover:bg-primary-500",
            pathname === "/conversations" && "bg-primary-500 text-white"
          )}>
          <IconBrandDiscordFilled className="size-6" />
        </div>
      </Link>
    </ActionTooltip>
  );
}
