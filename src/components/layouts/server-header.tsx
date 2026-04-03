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
  IconPlus,
  IconSettings,
  IconTrash,
  IconUserPlus,
  IconUsers
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useModal } from "@/hooks/use-modal-store";

type ServerHeaderProps = {
  server: ServerWithMembersWithProfiles;
  role?: MemberRole;
};
export function ServerHeader({ server, role }: ServerHeaderProps) {
  const { open } = useModal();
  const isAdmin = role === MemberRole.ADMIN;
  const isModerator = isAdmin || role === MemberRole.MODERATOR;

  return (
    <div className="w-full">
      <DropdownMenu>
        <DropdownMenuTrigger
          className={
            "flex w-full items-center justify-between border-none bg-transparent focus:outline-none dark:bg-transparent"
          }
          render={
            <Button variant="outline" className={"flex items-center gap-1"}>
              <span className="line-clamp-1 leading-relaxed font-medium">
                {server.name}
              </span>
              <IconChevronDown className="size-5" />
            </Button>
          }></DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            {isModerator && (
              <DropdownMenuItem
                onClick={() =>
                  open("invite-people", {
                    server: {
                      _id: server._id,
                      name: server.name,
                      logo: server.logo,
                      inviteCode: server.inviteCode,
                      profileId: server.profileId
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
                className={
                  "flex cursor-pointer items-center justify-between gap-2 px-3 py-1.5"
                }>
                <span className="text-base">Server Setting</span>
                <IconSettings className="size-4" />
              </DropdownMenuItem>
            )}
            {isAdmin && (
              <DropdownMenuItem
                className={
                  "flex cursor-pointer items-center justify-between gap-2 px-3 py-1.5"
                }>
                <span className="text-base">Manage Members</span>
                <IconUsers className="size-4" />
              </DropdownMenuItem>
            )}
            {isModerator && (
              <DropdownMenuItem
                className={
                  "flex cursor-pointer items-center justify-between gap-2 px-3 py-1.5"
                }>
                <span className="text-base">Create Channel</span>
                <IconPlus className="size-4" />
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          {isAdmin && (
            <DropdownMenuItem
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
              className={cn(
                "mt-1 flex cursor-pointer items-center justify-between gap-2 px-3 py-1.5 text-red-500"
              )}>
              <span className="text-base">Leave Server</span>
              <IconTrash className="size-4" />
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
