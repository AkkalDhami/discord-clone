"use client";

import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";
import { cn } from "@/lib/utils";
import { IconUserPlus } from "@tabler/icons-react";

export function AddFriendButton({
  className,
  variant = "default"
}: {
  className?: string;
  variant?: "icon" | "default";
}) {
  const { open } = useModal();
  return (
    <Button
      variant={"primary"}
      onClick={() => open("add-friend")}
      className={cn(variant === "default" ? "px-4" : "px-2", className)}>
      {variant === "default" ? (
        "Add Friend"
      ) : (
        <>
          <IconUserPlus
            className="size-6 cursor-pointer p-0.5 text-white"
            onClick={() => open("add-friend")}
          />
        </>
      )}
    </Button>
  );
}
