import { Member as MemberInterface } from "@/interface";
import { UserAvatar } from "@/components/common/user-avatar";
import { RoleIconMap } from "@/components/modals/member-modal";
import MemberRole from "@/enums/role.enum";

export function MemberItem({ member }: { member: MemberInterface }) {
  return (
    <div className="hover:bg-secondary flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 transition">
      <UserAvatar
        src={member.profile.avatar?.url}
        name={member.profile.name}
        className="size-10"
      />
      <div className="flex flex-col space-y-1">
        <p className="flex items-center gap-2 text-sm font-medium">
          {member.profile.name}
          {RoleIconMap[member.role as MemberRole]}
        </p>
        <p className="text-muted-primary text-xs">
          {`@${member.profile.username || member.profile.email}`}
        </p>
      </div>
    </div>
  );
}
