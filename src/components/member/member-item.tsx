"use client";

import { Member as MemberInterface } from "@/interface";
import { UserAvatar } from "@/components/common/user-avatar";
import { RoleIconMap } from "@/components/modals/member-modal";
import MemberRole from "@/enums/role.enum";
import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";

export function MemberItem({
  member,
  userId
}: {
  member: string;
  userId: string;
}) {
  const params = useParams();
  const memberData = JSON.parse(member) as MemberInterface;
  return (
    <Link
      href={`/servers/${memberData.serverId}/conversations/${memberData._id}`}
      className={cn(
        "hover:bg-secondary flex w-full cursor-pointer items-center gap-2 px-3 py-3 transition",
        "border-edge border-t last:border-b",
        params.memberId === memberData._id && "bg-secondary",
        userId === memberData.profileId &&
          "pointer-events-none bg-indigo-500/10 dark:bg-indigo-500/20"
      )}>
      <UserAvatar
        src={memberData.profile.avatar?.url}
        name={memberData.profile.name}
        className="size-10"
      />
      <div className="flex flex-col">
        <p className="flex items-center gap-2 text-sm font-medium">
          {memberData.profile.name}
          {RoleIconMap[memberData.role as MemberRole]}
          {userId === memberData.profileId && " (You)"}
        </p>
        <p className="text-muted-primary text-xs">
          {`@${memberData.profile.username || memberData.profile.email}`}
        </p>
      </div>
    </Link>
  );
}
