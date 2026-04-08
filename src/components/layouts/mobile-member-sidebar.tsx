import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger
} from "@/components/ui/sheet";
import { MemberSidebar } from "@/components/layouts/member-sidebar";

import { IconMenu2 } from "@tabler/icons-react";

export function MobileMemberSidebar({ serverId }: { serverId: string }) {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <IconMenu2
            className={"bg-secondary size-9 cursor-pointer rounded-lg p-1.5"}
          />
        }></SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <MemberSidebar serverId={serverId} />
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
