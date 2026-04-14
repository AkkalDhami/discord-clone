import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

import { ServerSidebar } from "@/components/layouts/server-sidebar";
import { NavigationSidebar } from "@/components/layouts/navigation-sidebar";

import { IconChevronLeft } from "@tabler/icons-react";

export function MobileServerSidebar({ serverId }: { serverId: string }) {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant={"ghost"} className={"px-1 py-3"}>
            <IconChevronLeft className={"size-6"} />
          </Button>
        }></SheetTrigger>
      <SheetContent
        side="left"
        className={
          "flex flex-row items-center gap-0 pt-12 data-[side=left]:w-[98%]"
        }>
        <NavigationSidebar className="border-edge border-r p-2 pt-3" />
        <ServerSidebar serverId={serverId} />
      </SheetContent>
    </Sheet>
  );
}
