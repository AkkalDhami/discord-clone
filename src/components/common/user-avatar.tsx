"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type UserAvatarProps = {
  src?: string;
  name?: string;
  className?: string;
};

export function UserAvatar({ src, name, className }: UserAvatarProps) {
  return (
    <Avatar className={cn("size-10", className)}>
      <AvatarImage src={src} />
      <AvatarFallback className="bg-indigo-500 text-white">
        {name?.slice(0, 1).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}
