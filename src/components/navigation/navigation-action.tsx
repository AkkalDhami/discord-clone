"use client";

import { IconPlus } from "@tabler/icons-react";
import { ActionTooltip } from "@/components/common/action-tooltip";
import { useModal } from "@/hooks/use-modal-store";

export function NavigationAction() {
  const { open } = useModal();
  return (
    <ActionTooltip label="Add a server" side="right" align="center">
      <div
        onClick={() => open("create-server")}
        className="group cursor-pointer">
        <div className="flex size-11 items-center justify-center rounded-xl bg-neutral-200 transition-all group-hover:bg-indigo-500 dark:bg-neutral-900 dark:group-hover:bg-indigo-500">
          <IconPlus className="bg-accent-foreground text-accent size-6 rounded-full p-1" />
        </div>
      </div>
    </ActionTooltip>
  );
}
