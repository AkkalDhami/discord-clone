"use client";

import { IconGridDots, IconPlus } from "@tabler/icons-react";
import { ActionTooltip } from "@/components/common/action-tooltip";
import { useModal } from "@/hooks/use-modal-store";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function NavigationAction() {
  const { open } = useModal();
  return (
    <ActionTooltip label="Add a server" side="right" align="center">
      <div
        onClick={() => open("create-server")}
        className="group cursor-pointer">
        <div className="bg-secondary flex size-11 items-center justify-center rounded-xl transition-all group-hover:bg-indigo-500 dark:group-hover:bg-indigo-500">
          <IconPlus className="bg-accent-foreground text-accent size-5.5 rounded-full p-1" />
        </div>
      </div>
    </ActionTooltip>
  );
}

export function MyServers() {
  const pathname = usePathname();
  return (
    <ActionTooltip label="My Servers" side="right" align="center">
      <Link
        href="/servers"
        className={cn(
          "group bg-secondary relative mx-3 flex size-10 cursor-pointer items-center justify-center rounded-lg hover:bg-indigo-500 hover:text-white",
          pathname === "/servers" && "bg-primary-500 text-white"
        )}>
        <IconGridDots className="size-6" stroke={1.5} />
        <div
          className={cn(
            "bg-primary absolute top-1/2 -left-3 w-1 -translate-y-1/2 rounded-r-full transition-all",
            pathname !== "/servers" && "group-hover:h-5",
            pathname === "/servers" ? "h-9" : "h-2"
          )}
        />
      </Link>
    </ActionTooltip>
  );
}
