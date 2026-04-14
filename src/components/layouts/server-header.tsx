"use client";
import MemberRole from "@/enums/role.enum";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ServerWithMembersWithProfiles } from "@/types/server";
import {
  IconChevronDown,
  IconFolderPlus,
  IconPlus,
  IconSettings,
  IconTrash,
  IconUserPlus,
  IconUsers,
  IconUsersPlus
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useModal } from "@/hooks/use-modal-store";
import { ActionTooltip } from "@/components/common/action-tooltip";

type ServerHeaderProps = {
  server: string;
  role?: MemberRole;
};
export function ServerHeader({ server, role }: ServerHeaderProps) {
  const { open } = useModal();
  const serverObj = JSON.parse(server) as ServerWithMembersWithProfiles;
  const isAdmin = role === MemberRole.ADMIN;
  const isModerator = isAdmin || role === MemberRole.MODERATOR;

  return (
    <div className="border-edge flex w-full justify-between gap-4 border-y py-2">
      <DropdownMenu>
        <DropdownMenuTrigger
          className={
            "mx-2 flex-1 justify-between border-none bg-transparent hover:bg-neutral-200 focus:outline-none dark:bg-transparent"
          }
          render={
            <Button variant="ghost" className={"flex items-center gap-1"}>
              <span className="line-clamp-1 leading-relaxed font-medium">
                {serverObj.name}
              </span>
              <IconChevronDown className="size-5" />
            </Button>
          }></DropdownMenuTrigger>
        <DropdownMenuContent className={"p-2"}>
          <DropdownMenuGroup>
            {isModerator && (
              <DropdownMenuItem
                onClick={() =>
                  open("invite-people", {
                    server: {
                      _id: serverObj._id,
                      name: serverObj.name,
                      logo: serverObj.logo,
                      inviteCode: serverObj.inviteCode,
                      profileId: serverObj.profileId,
                      members: serverObj.members
                    }
                  })
                }
                className={
                  "flex cursor-pointer items-center justify-between gap-2 px-3 py-1.5"
                }>
                <span className="text-base">Invite People</span>
                <IconUserPlus className="size-4" />
              </DropdownMenuItem>
            )}
            {isAdmin && (
              <DropdownMenuItem
                onClick={() =>
                  open("edit-server", {
                    server: {
                      _id: serverObj._id,
                      name: serverObj.name,
                      logo: serverObj.logo,
                      inviteCode: serverObj.inviteCode,
                      profileId: serverObj.profileId,
                      members: serverObj.members
                    }
                  })
                }
                className={
                  "flex cursor-pointer items-center justify-between gap-2 px-3 py-1.5"
                }>
                <span className="text-base">Server Setting</span>
                <IconSettings className="size-4" />
              </DropdownMenuItem>
            )}
            {isAdmin && (
              <DropdownMenuItem
                onClick={() =>
                  open("members", {
                    server: {
                      _id: serverObj._id,
                      name: serverObj.name,
                      logo: serverObj.logo,
                      inviteCode: serverObj.inviteCode,
                      profileId: serverObj.profileId,
                      members: serverObj.members
                    }
                  })
                }
                className={
                  "flex cursor-pointer items-center justify-between gap-2 px-3 py-1.5"
                }>
                <span className="text-base">Manage Members</span>
                <IconUsers className="size-4" />
              </DropdownMenuItem>
            )}
            {isModerator && (
              <DropdownMenuItem
                onClick={() =>
                  open("create-channel", {
                    server: {
                      _id: serverObj._id,
                      name: serverObj.name,
                      logo: serverObj.logo,
                      inviteCode: serverObj.inviteCode,
                      profileId: serverObj.profileId,
                      members: serverObj.members
                    }
                  })
                }
                className={
                  "flex cursor-pointer items-center justify-between gap-2 px-3 py-1.5"
                }>
                <span className="text-base">Create Channel</span>
                <IconPlus className="size-4" />
              </DropdownMenuItem>
            )}
            {isModerator && (
              <DropdownMenuItem
                onClick={() =>
                  open("create-category", {
                    server: {
                      _id: serverObj._id,
                      name: serverObj.name,
                      logo: serverObj.logo,
                      inviteCode: serverObj.inviteCode,
                      profileId: serverObj.profileId,
                      members: serverObj.members
                    }
                  })
                }
                className={
                  "flex cursor-pointer items-center justify-between gap-2 px-3 py-1.5"
                }>
                <span className="text-base">Create Category</span>
                <IconFolderPlus className="size-4" />
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          {isAdmin && (
            <DropdownMenuItem
              onClick={() =>
                open("delete-server", {
                  server: {
                    _id: serverObj._id,
                    name: serverObj.name,
                    logo: serverObj.logo,
                    inviteCode: serverObj.inviteCode,
                    profileId: serverObj.profileId,
                    members: serverObj.members
                  }
                })
              }
              className={cn(
                "flex cursor-pointer items-center justify-between gap-2 px-3 py-1.5 text-red-500",
                "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40"
              )}>
              <span className="text-base">Delete Server</span>
              <IconTrash className="size-4" />
            </DropdownMenuItem>
          )}
          {!isAdmin && (
            <DropdownMenuItem
              onClick={() =>
                open("leave-server", {
                  server: {
                    _id: serverObj._id,
                    name: serverObj.name,
                    logo: serverObj.logo,
                    inviteCode: serverObj.inviteCode,
                    profileId: serverObj.profileId,
                    members: serverObj.members
                  }
                })
              }
              className={cn(
                "mt-1 flex cursor-pointer items-center justify-between gap-2 px-3 py-1.5 text-red-500"
              )}>
              <span className="text-base">Leave Server</span>
              <IconTrash className="size-4" />
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {isModerator && (
        <ActionTooltip label="Invite to server" side="right">
          <div
            onClick={() => open("invite-people", { server: serverObj })}
            className={
              "hove:bg-secondary text-secondary-foreground dark:hover:bg-secondary mr-2 cursor-pointer rounded-md p-2"
            }>
            <IconUsersPlus className="size-4" />
          </div>
        </ActionTooltip>
      )}
    </div>
  );
}
