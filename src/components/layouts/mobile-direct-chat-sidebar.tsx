import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

import { NavigationSidebar } from "@/components/layouts/navigation-sidebar";

import { IconChevronLeft } from "@tabler/icons-react";
import { DirectChatSidebar } from "@/components/layouts/direct-chat-sidebar";

export function MobileDirectChatSidebar() {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant={"secondary"} className={"px-1 py-3"}>
            <IconChevronLeft className={"size-6"} />
          </Button>
        }></SheetTrigger>
      <SheetContent
        side="left"
        className={
          "flex flex-row items-center gap-0 pt-12 data-[side=left]:w-[98%]"
        }>
        <NavigationSidebar className="border-edge p-2 pt-3" />
        <div className="flex-1 pt-4 pr-1">
          <DirectChatSidebar />
        </div>
      </SheetContent>
    </Sheet>
  );
}
