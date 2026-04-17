import { IconUsers } from "@tabler/icons-react";
import { Button } from "../ui/button";

export function DirectChatItemSection() {
  return (
    <div className="border-edge flex gap-2 border-b px-2 py-2">
      <Button
        variant="ghost"
        className={"text-muted-foreground w-full justify-start py-1.5"}>
        <IconUsers className="size-4" />
        Friends
      </Button>
    </div>
  );
}
