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
        <div className="bg-secondary flex size-10 items-center justify-center rounded-xl transition-all group-hover:bg-indigo-500 sm:size-11 dark:group-hover:bg-indigo-500">
          <IconPlus className="bg-accent-foreground text-accent size-4 rounded-full sm:size-5.5 sm:p-1" />
        </div>
      </div>
    </ActionTooltip>
  );
}
