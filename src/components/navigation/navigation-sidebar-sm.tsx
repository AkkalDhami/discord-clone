import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

import { NavigationSidebar } from "@/components/layouts/navigation-sidebar";

import { IconMenu2 } from "@tabler/icons-react";

export function MobileNavigationSidebar() {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant={"secondary"} className={"px-1 py-3 md:hidden"}>
            <IconMenu2 className={"size-6"} />
          </Button>
        }></SheetTrigger>
      <SheetContent
        side="left"
        className={
          "flex flex-row items-center gap-0 border-transparent pt-12 data-[side=left]:w-[14%]"
        }>
        <NavigationSidebar className="border-edge p-2 pt-3" />
      </SheetContent>
    </Sheet>
  );
}
