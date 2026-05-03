"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import {
  IconChevronDown,
  IconCrownFilled,
  IconDotsVertical,
  IconPhoneCall,
  IconUserExclamation,
  IconUserOff,
  IconUsers,
  IconVideo,
  IconX
} from "@tabler/icons-react";
import { removeLeadingEmoji } from "@/utils/remove-leading-emoji";
import { UserAvatar } from "@/components/common/user-avatar";
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

import { cn } from "@/lib/utils";
import { SidebarProfileData, useModal } from "@/hooks/use-modal-store";
import { useUser } from "@/hooks/use-user-store";
import Link from "next/link";
import { PartialProfile } from "@/types/friend";

export function ProfileSidebar() {
  const { isOpen, type, data } = useModal();

  const isSidebarOpen = isOpen && type === "profile-sidebar";

  const { sidebarProfile } = data;

  return (
    isSidebarOpen && (
      <aside
        className={cn(
          "border-edge no-scrollbar bg-popover fixed right-1 z-20 mb-6 flex h-full w-80 flex-col overflow-y-auto border-x border-b pt-4"
        )}>
        {sidebarProfile?.type === "direct" ? (
          <DirectProfileSidebar />
        ) : (
          <GroupSidebar {...sidebarProfile} />
        )}
      </aside>
    )
  );
}

function DirectProfileSidebar() {
  const { isOpen, close, type, open, data } = useModal();

  const isSidebarOpen = isOpen && type === "profile-sidebar";

  const { sidebarProfile } = data;
  const friend = sidebarProfile?.friend;
  const mutualFriends = sidebarProfile?.mutualFriends || [];
  const mutualServers = sidebarProfile?.mutualServers || [];
  const servers = sidebarProfile?.servers || [];

  return (
    <>
      <div className="relative h-24 bg-linear-to-r from-neutral-300 to-neutral-400 dark:from-neutral-700 dark:to-neutral-800">
        <div className="absolute top-3 right-3 flex gap-2">
          <Button
            size="icon"
            onClick={() => {
              if (isSidebarOpen) {
                close();
              }
            }}
            variant="secondary"
            className="rounded-full">
            <IconX size={16} />
          </Button>
        </div>
      </div>

      <div className="space-y-3 px-4 pb-4">
        <div className="-mt-10 flex items-end gap-3">
          <UserAvatar
            src={friend?.avatar?.url}
            className="size-20 border-4"
            name={friend?.name}
          />
        </div>

        <div className="flex justify-between">
          <div>
            <h2 className="text-lg font-medium">{friend?.name}</h2>
            <p className="text-muted-foreground text-sm">@{friend?.username}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <IconDotsVertical className="hover:text-accent-foreground bg-background text-muted-foreground flex size-8 cursor-pointer items-center justify-center rounded-full p-1.5" />
              }></DropdownMenuTrigger>
            <DropdownMenuContent className={"min-w-50"}>
              <DropdownMenuGroup>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    Invite to Server
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent className={"space-y-1.5"}>
                      {servers &&
                        servers.length > 0 &&
                        servers?.map(({ _id, logo, inviteCode, name }) => (
                          <DropdownMenuItem
                            key={_id}
                            className={"flex items-center gap-3 px-1.5 py-2"}>
                            {logo ? (
                              <Image
                                className="size-6 rounded-lg object-cover object-center"
                                src={logo}
                                alt={name}
                                width={50}
                                height={50}
                              />
                            ) : (
                              <div
                                className={cn(
                                  "bg-primary-500 flex size-6 items-center justify-center rounded-lg font-medium text-white transition-all"
                                )}>
                                {removeLeadingEmoji(name)
                                  ?.charAt(0)
                                  ?.toUpperCase()}
                              </div>
                            )}
                            <h3 className="font-normal">{name}</h3>
                          </DropdownMenuItem>
                        ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className={cn("flex items-center justify-between gap-3")}>
                  <span>Start Video Call</span>
                  <IconVideo className="text-muted-foreground size-4" />
                </DropdownMenuItem>

                <DropdownMenuItem
                  className={cn("flex items-center justify-between gap-3")}>
                  <span>Start Voice Call</span>
                  <IconPhoneCall className="text-muted-foreground size-4" />
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => {
                    open("block-friend", {
                      friend: friend as PartialProfile
                    });
                  }}
                  className={cn("flex items-center justify-between gap-3")}>
                  <span>Block Friend</span>
                  <IconUserExclamation className="text-muted-foreground size-4" />
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => {
                    open("remove-friend", {
                      friend: friend as PartialProfile
                    });
                  }}
                  className={cn("flex items-center justify-between gap-3")}>
                  <span>Ignore Friend</span>
                  <IconUserOff className="text-muted-foreground size-4" />
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="bg-muted rounded-lg p-3">
          <p className="text-muted-primary text-xs font-normal">Member Since</p>
          <p className="mt-1 text-sm">{friend?.memberSince}</p>
        </div>

        <div className="bg-muted divide-y divide-neutral-500/30 rounded-lg py-2">
          <Collapsible>
            <CollapsibleTrigger
              render={
                <Button
                  variant="ghost"
                  className="text-muted-primary w-full font-normal">
                  Mutual Servers — {mutualServers && mutualServers.length}
                  <IconChevronDown className="ml-auto -rotate-90 group-data-panel-open/button:rotate-0" />
                </Button>
              }
            />

            <CollapsibleContent className="flex w-full flex-col items-start gap-2 bg-transparent p-2.5 pt-0 text-sm">
              <div className="mt-3 w-full space-y-2">
                {mutualServers &&
                  mutualServers.map(server => (
                    <Link
                      key={server._id}
                      href={`/servers/${server._id}`}
                      className="flex w-full items-center gap-3 rounded-md p-1.5 duration-300 hover:bg-neutral-200 dark:hover:bg-neutral-800">
                      <div className="bg-primary-500 flex h-10 w-10 items-center justify-center rounded-xl font-normal text-white">
                        {server.logo ? (
                          <Image
                            src={server.logo}
                            alt={server.name}
                            width={40}
                            height={40}
                            className="rounded-lg object-cover object-center"
                          />
                        ) : (
                          removeLeadingEmoji(server.name).slice(0, 1)
                        )}
                      </div>
                      <h3 className="text-lg font-normal">{server.name}</h3>
                    </Link>
                  ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible className={"mt-2"}>
            <CollapsibleTrigger
              render={
                <Button
                  variant="ghost"
                  className="text-muted-primary w-full font-normal">
                  Mutual Friends — {mutualFriends && mutualFriends.length}
                  <IconChevronDown className="ml-auto -rotate-90 group-data-panel-open/button:rotate-0" />
                </Button>
              }
            />

            <CollapsibleContent className="flex w-full flex-col items-start gap-2 bg-transparent p-2.5 pt-0 text-sm">
              <div className="mt-3 w-full space-y-2">
                {mutualFriends &&
                  mutualFriends.map(f => (
                    <div
                      key={f._id}
                      className="flex w-full items-center gap-3 rounded-md p-1.5 duration-300 hover:bg-neutral-200 dark:hover:bg-neutral-800">
                      <UserAvatar src={f.avatar?.url} name={f.name} />
                      <div>
                        <p>{f.name}</p>
                        <p className="text-muted-foreground text-xs">
                          @{f.username}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </>
  );
}

function GroupSidebar({
  members,
  adminId
}: Pick<SidebarProfileData, "members" | "adminId">) {
  const { user } = useUser();

  const { isOpen, close, type } = useModal();

  const isSidebarOpen = isOpen && type === "profile-sidebar";

  return (
    members &&
    members?.length > 0 && (
      <aside>
        <div className="border-edge flex items-center justify-between border-y py-2.5 pl-4">
          <h2 className="text-muted-primary flex items-center gap-2 font-normal uppercase">
            <IconUsers className="size-4" /> Members [{members?.length}]
          </h2>
          <Button
            size="icon"
            onClick={() => {
              if (isSidebarOpen) {
                close();
              }
            }}
            variant="ghost"
            className="rounded-lg">
            <IconX size={16} />
          </Button>
        </div>
        <div className="mt-2 flex flex-col">
          {members.length > 0 &&
            members?.map(m => (
              <div
                key={m._id}
                className={cn(
                  "hover:bg-secondary relative flex w-full items-center gap-2 px-3 py-3 transition",
                  "border-edge border-t last:border-b"
                )}>
                <UserAvatar src={m.avatar?.url} name={m.name} />
                <div>
                  <h3 className="flex items-center gap-2 font-normal">
                    {m.name}
                    {m._id === user?.id && (
                      <div className="bg-primary-600 absolute top-2 right-3 size-2 rounded-full" />
                    )}
                    {m._id === adminId && (
                      <IconCrownFilled className="size-4 text-orange-500" />
                    )}
                  </h3>
                  <p className="text-muted-foreground text-xs">@{m.username}</p>
                </div>
              </div>
            ))}
        </div>
      </aside>
    )
  );
}
