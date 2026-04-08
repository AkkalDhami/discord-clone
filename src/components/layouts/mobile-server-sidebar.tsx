import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { IconMenu2 } from "@tabler/icons-react";
import { ServerSidebar } from "@/components/layouts/server-sidebar";
import { NavigationSidebar } from "@/components/layouts/navigation-sidebar";

export function MobileServerSidebar({ serverId }: { serverId: string }) {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <IconMenu2
            className={"bg-secondary size-9 cursor-pointer rounded-lg p-1.5"}
          />
        }></SheetTrigger>
      <SheetContent
        side="left"
        className={
          "flex flex-row items-center gap-0 pt-12 data-[side=left]:w-[95%]"
        }>
        <NavigationSidebar className="border-edge p-2 border-r pt-3" />
        <ServerSidebar serverId={serverId} />
      </SheetContent>
    </Sheet>
  );
}
