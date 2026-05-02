"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type UserAvatarProps = {
  src?: string;
  name?: string;
  className?: string;
  rounded?: "lg" | "md" | "full" | "sm";
};

export function UserAvatar({
  src,
  name,
  className,
  rounded = "full"
}: UserAvatarProps) {
  return (
    <Avatar
      className={cn("size-10", className, `rounded-${rounded}` as string)}>
      <AvatarImage src={src} />
      <AvatarFallback
        className={cn(
          "bg-indigo-500 text-white",
          rounded === "lg" && "rounded-lg",
          rounded === "md" && "rounded-md",
          rounded === "full" && "rounded-full",
          rounded === "sm" && "rounded-sm"
        )}>
        {name?.slice(0, 1).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}
