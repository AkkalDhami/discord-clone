"use client";

import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";

export function AddFriendButton() {
  const { open } = useModal();
  return (
    <Button variant={"primary"} onClick={() => open("add-friend")}>
      Add Friend
    </Button>
  );
}
