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
      <Link href={"/conversations"} className="group relative cursor-pointer">
        <div
          className={cn(
            "bg-primary absolute top-1/2 -left-8.5 w-1 -translate-y-1/2 rounded-r-full transition-all",
            pathname !== "/conversations" && "group-hover:h-5",
            pathname === "/conversations" && "h-9"
          )}
        />
        <div
          className={cn(
            "bg-secondary group-hover:bg-primary-500 dark:group-hover:bg-primary-500 flex size-10 items-center justify-center rounded-xl transition-all sm:size-10",
            pathname === "/conversations" && "bg-primary-500 text-white"
          )}>
          <IconBrandDiscordFilled className="size-6" />
        </div>
      </Link>
    </ActionTooltip>
  );
}
