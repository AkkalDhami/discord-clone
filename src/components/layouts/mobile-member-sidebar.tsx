import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MemberSidebar } from "@/components/layouts/member-sidebar";
import { Button } from "@/components/ui/button";

import { IconMenu2 } from "@tabler/icons-react";

export function MobileMemberSidebar({ serverId }: { serverId: string }) {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant={"ghost"} className={"px-1 py-3"}>
            <IconMenu2 className={"size-6"} />
          </Button>
        }></SheetTrigger>
      <SheetContent>
        <MemberSidebar serverId={serverId} />
      </SheetContent>
    </Sheet>
  );
}
