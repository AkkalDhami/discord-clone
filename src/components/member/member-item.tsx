"use client";

import { Member as MemberInterface } from "@/interface";
import { UserAvatar } from "@/components/common/user-avatar";
import { RoleIconMap } from "@/components/modals/member-modal";
import MemberRole from "@/enums/role.enum";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { IconMessageCircle } from "@tabler/icons-react";

export function MemberItem({
  member,
  userId
}: {
  member: string;
  userId: string;
}) {
  const memberData = JSON.parse(member) as MemberInterface;
  return (
    <div
      className={cn(
        "relative flex w-full items-center justify-between gap-2 px-3 py-3 transition",
        "border-edge border-t last:border-b",
        userId === memberData.profileId && "bg-secondary"
      )}>
      {userId === memberData.profileId && (
        <div className="bg-primary-600 absolute top-2 right-3 size-2 rounded-full" />
      )}
      <div className="flex items-center gap-2">
        <UserAvatar
          src={memberData.profile.avatar?.url}
          name={memberData.profile.name}
          className="size-10"
        />
        <div className="relative flex flex-col">
          <p className="flex items-center gap-2 text-sm font-medium">
            {memberData.profile.name}
            <span>{RoleIconMap[memberData.role as MemberRole]}</span>
          </p>
          <p className="text-muted-primary text-xs">
            {`@${memberData.profile.username || memberData.profile.email}`}
          </p>
        </div>
      </div>
      {userId !== memberData.profileId && (
        <Button
          variant="secondary"
          size="icon"
          nativeButton={false}
          render={
            <Link href={`/conversations/${memberData._id}`}>
              <IconMessageCircle />
            </Link>
          }></Button>
      )}
    </div>
  );
}
