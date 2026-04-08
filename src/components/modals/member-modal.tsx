"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { useModal } from "@/hooks/use-modal-store";
import { ServerWithMembersWithProfiles } from "@/types/server";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserAvatar } from "@/components/common/user-avatar";
import {
  IconCheck,
  IconCrownFilled,
  IconDotsVertical,
  IconGavel,
  IconRosetteFilled,
  IconShield,
  IconShieldCheck,
  IconShieldQuestion,
  IconSwords
} from "@tabler/icons-react";
import MemberRole from "@/enums/role.enum";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import toast from "react-hot-toast";
import { useMember } from "@/hooks/use-member";
import { useRouter } from "next/navigation";

export const RoleIconMap = {
  [MemberRole.ADMIN]: <IconCrownFilled className="size-4 text-orange-500" />,
  [MemberRole.MODERATOR]: <IconSwords className="size-4 text-indigo-500" />,
  [MemberRole.GUEST]: <IconRosetteFilled className="size-4 text-blue-500" />
};

export function MemberModal() {
  const { close, isOpen, type, data, open } = useModal();
  const { updateMemberRole, isRoleUpdating, deleteMember, isMemberDeleting } =
    useMember();
  const router = useRouter();

  const [loadingId, setLoadingId] = useState<string | null>(null);

  const isModalOpen = isOpen && type === "members";

  const { server } = data as { server: ServerWithMembersWithProfiles };

  if (!server) {
    return;
  }

  const onKick = async (memberId: string) => {
    try {
      setLoadingId(memberId);
      const res = await deleteMember({ serverId: server._id, memberId });

      if (res.success) {
        toast.success(res.message);
        router.refresh();
        open("members", {
          server: {
            ...server,
            members: server.members.filter(member => member._id !== memberId)
          }
        });
        return;
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to kick member");
    } finally {
      setLoadingId(null);
    }
  };

  const onRoleChange = async (memberId: string, role: MemberRole) => {
    try {
      setLoadingId(memberId);
      const res = await updateMemberRole({
        serverId: server._id,
        memberId,
        role
      });

      if (res.success) {
        toast.success(res.message);
        router.refresh();
        open("members", {
          server: {
            ...server,
            members: server.members.map(member => {
              if (member._id === memberId) {
                return {
                  ...member,
                  role
                };
              }
              return member;
            })
          }
        });
        return;
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to change role");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={open => {
        if (!open) close();
      }}>
      <DialogContent className={"w-full max-w-200"}>
        <DialogHeader>
          <DialogTitle>Manage Members</DialogTitle>
          <DialogDescription className={"text-base font-medium"}>
            {server.members.length} Member{server.members.length > 1 ? "s" : ""}
          </DialogDescription>

          <ScrollArea className={"mt-4 h-75 w-full pr-6"}>
            {server.members.map(member => (
              <div
                key={member._id}
                className={"mt-3 flex items-center justify-between first:mt-0"}>
                <div className="flex items-center gap-2">
                  <UserAvatar
                    src={member.profile.avatar?.url}
                    name={member.profile.name}
                  />
                  <div>
                    <p className="flex items-center gap-2 text-sm font-medium">
                      {member.profile.name}
                      {member.role && RoleIconMap[member.role as MemberRole]}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {member.profile.email}
                    </p>
                  </div>
                </div>

                {server.profileId !== member.profileId &&
                  loadingId !== member._id && (
                    <div className="ml-auto">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant={"ghost"} size={"icon"}>
                              <IconDotsVertical className="text-muted-foreground size-4" />
                            </Button>
                          }></DropdownMenuTrigger>

                        <DropdownMenuContent>
                          <DropdownMenuGroup>
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger
                                className={
                                  "flex items-center gap-3 px-3 py-1.5"
                                }>
                                <IconShieldQuestion className="size-4" /> Role
                              </DropdownMenuSubTrigger>
                              <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      onRoleChange(member._id, MemberRole.GUEST)
                                    }
                                    className={
                                      "flex cursor-pointer items-center justify-between gap-2 px-3 py-1.5"
                                    }>
                                    <div className="flex items-center gap-2">
                                      <IconShield className="size-4" />
                                      Guest
                                    </div>
                                    {member.role === MemberRole.GUEST && (
                                      <IconCheck className="size-4" />
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      onRoleChange(
                                        member._id,
                                        MemberRole.MODERATOR
                                      )
                                    }
                                    className={
                                      "flex cursor-pointer items-center justify-between gap-2 px-3 py-1.5"
                                    }>
                                    <div className="flex items-center gap-2">
                                      <IconShieldCheck className="size-4" />
                                      Moderator
                                    </div>
                                    {member.role === MemberRole.MODERATOR && (
                                      <IconCheck className="size-4" />
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => onKick(member._id)}
                                    className={
                                      "flex cursor-pointer items-center justify-between gap-2 px-3 py-1.5"
                                    }>
                                    <div className="flex items-center gap-2">
                                      <IconGavel className="size-4" />
                                      Kick
                                    </div>
                                  </DropdownMenuItem>
                                </DropdownMenuSubContent>
                              </DropdownMenuPortal>
                            </DropdownMenuSub>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}

                {isRoleUpdating ||
                  (isMemberDeleting && loadingId === member._id && (
                    <Spinner className="ml-3 size-4" />
                  ))}
              </div>
            ))}
          </ScrollArea>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
