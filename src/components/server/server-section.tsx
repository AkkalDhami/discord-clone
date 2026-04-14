"use client";

import ChannelType from "@/enums/channel.enum";
import MemberRole from "@/enums/role.enum";
import { Category, Channel, Member } from "@/interface";
import { ServerWithMembersWithProfiles } from "@/types/server";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from "@/components/ui/context-menu";

import {
  IconChevronDown,
  IconFolderPlus,
  IconHash,
  IconLockFilled,
  IconPencil,
  IconPlus,
  IconSettings,
  IconTrash,
  IconUserPlus,
  IconUsers,
  IconVideo,
  IconVolume
} from "@tabler/icons-react";
import { ActionTooltip } from "@/components/common/action-tooltip";
import { useModal } from "@/hooks/use-modal-store";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Route } from "next";
import { useParams } from "next/navigation";

type ServerSectionProps = {
  server: string;
  role?: MemberRole;
  memberId: string;
};

export const ChannelTypeMap = {
  [ChannelType.TEXT]: IconHash,
  [ChannelType.AUDIO]: IconVolume,
  [ChannelType.VIDEO]: IconVideo
};

export function ServerSection({ server, role, memberId }: ServerSectionProps) {
  const serverData = JSON.parse(server) as ServerWithMembersWithProfiles;
  // console.log({ serverData });
  const { open } = useModal();
  const param: {
    serverId: string;
    channelId: string;
    memberId?: string;
  } = useParams();

  const isAdmin = role === MemberRole.ADMIN;
  const isModerator = isAdmin || role === MemberRole.MODERATOR;

  const members = serverData.members?.filter(
    (m: Member) => m.profile._id !== serverData.profileId
  );

  const serverPayload = {
    _id: serverData?._id,
    name: serverData?.name,
    logo: serverData?.logo,
    inviteCode: serverData?.inviteCode,
    profileId: serverData?.profileId,
    members: serverData?.members
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger className={"w-full space-y-4 p-3"}>
        <div className="w-full space-y-2">
          {serverData.channels?.map((channel: Channel) => (
            <ChannelCard
              key={channel._id}
              channel={channel}
              isModerator={isModerator}
              isAdmin={isAdmin}
              server={serverData}
            />
          ))}
        </div>
        <div className="space-y-4">
          {serverData.categories?.map((category: Category) => {
            const canViewPrivate =
              !category.private ||
              category.privateMembers?.some(
                (member: Member) => member._id === memberId
              );

            const channels = canViewPrivate ? category.channels : [];

            return (
              <Collapsible key={category._id} defaultOpen>
                <div className="group/category flex items-center justify-between px-2">
                  <CollapsibleTrigger className="group-hover/category:text-accent-foreground text-muted-secondary flex w-full cursor-pointer items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <p className="text-sm">{category.name}</p>
                      <IconChevronDown className="size-5 group-data-[state=open]:rotate-180" />
                    </div>
                  </CollapsibleTrigger>

                  <div className="flex items-center gap-1.5">
                    {isModerator && (
                      <ActionTooltip
                        label="Edit Category"
                        side="top"
                        align="center">
                        <IconPencil
                          onClick={() =>
                            open("edit-category", {
                              server: serverPayload,
                              category
                            })
                          }
                          className="text-muted-foreground hover:text-accent-foreground size-6 cursor-pointer p-0.5 opacity-0 group-hover/category:opacity-100"
                        />
                      </ActionTooltip>
                    )}

                    {isAdmin && (
                      <ActionTooltip
                        label="Delete Category"
                        side="top"
                        align="center">
                        <IconTrash
                          onClick={() =>
                            open("delete-category", {
                              server: serverPayload,
                              category
                            })
                          }
                          className="text-muted-foreground hover:text-accent-foreground size-6 cursor-pointer p-0.5 opacity-0 group-hover/category:opacity-100"
                        />
                      </ActionTooltip>
                    )}

                    {isModerator && (
                      <ActionTooltip
                        label="Create Channel"
                        side="top"
                        align="center">
                        <IconPlus
                          onClick={() =>
                            open("create-channel", {
                              server: serverPayload,
                              category
                            })
                          }
                          className="size-6 cursor-pointer p-1"
                        />
                      </ActionTooltip>
                    )}
                  </div>
                </div>

                <CollapsibleContent className="mt-2 space-y-2">
                  {channels?.map((channel: Channel) => (
                    <ChannelCard
                      key={channel._id}
                      channel={channel}
                      isModerator={isModerator}
                      isAdmin={isAdmin}
                      server={serverData}
                      isPrivate={category.private}
                    />
                  ))}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>

        {/* {members.length > 0 && (
          <div className="space-y-2">
            <div className="my-3 flex items-center justify-between">
              <h2 className="text-muted-foreground px-2 text-sm font-medium uppercase">
                Members
              </h2>
              {isAdmin && (
                <ActionTooltip
                  size="sm"
                  label={"Manage Members"}
                  side="top"
                  align="center">
                  <IconSettings
                    onClick={() =>
                      open("members", {
                        server: {
                          _id: serverData?._id,
                          name: serverData?.name,
                          logo: serverData?.logo,
                          inviteCode: serverData?.inviteCode,
                          profileId: serverData?.profileId,
                          members: serverData?.members
                        }
                      })
                    }
                    className="size-6 cursor-pointer p-1"
                  />
                </ActionTooltip>
              )}
            </div>

            {members?.map((m: Member) => (
              <Link
                key={m._id}
                href={
                  `/servers/${serverData._id}/conversations/${m._id}` as Route
                }
                className={cn(
                  "hover:bg-secondary flex w-full cursor-pointer items-center rounded-md px-2 py-1.5 transition",
                  param?.memberId === m._id && "bg-secondary"
                )}>
                <div className="flex items-center gap-2">
                  <UserAvatar
                    src={m.profile.avatar?.url}
                    name={m.profile.name}
                    className="size-8"
                  />
                  <p className="text-sm font-medium">
                    {m.profile.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )} */}
      </ContextMenuTrigger>

      <ContextMenuContent className={"max-w-100 p-2"}>
        {isModerator && (
          <ContextMenuItem
            onClick={() =>
              open("invite-people", {
                server: {
                  _id: serverData._id,
                  name: serverData.name,
                  logo: serverData.logo,
                  inviteCode: serverData.inviteCode,
                  profileId: serverData.profileId,
                  members: serverData.members
                }
              })
            }
            className={
              "flex cursor-pointer items-center justify-between gap-2 px-3 py-1.5"
            }>
            <span className="text-base">Invite People</span>
            <IconUserPlus className="size-4" />
          </ContextMenuItem>
        )}

        {isAdmin && (
          <ContextMenuItem
            onClick={() =>
              open("edit-server", {
                server: {
                  _id: serverData._id,
                  name: serverData.name,
                  logo: serverData.logo,
                  inviteCode: serverData.inviteCode,
                  profileId: serverData.profileId,
                  members: serverData.members
                }
              })
            }
            className={
              "flex cursor-pointer items-center justify-between gap-2 px-3 py-1.5"
            }>
            <span className="text-base">Server Setting</span>
            <IconSettings className="size-4" />
          </ContextMenuItem>
        )}

        {isAdmin && (
          <ContextMenuItem
            onClick={() =>
              open("members", {
                server: {
                  _id: serverData._id,
                  name: serverData.name,
                  logo: serverData.logo,
                  inviteCode: serverData.inviteCode,
                  profileId: serverData.profileId,
                  members: serverData.members
                }
              })
            }
            className={
              "flex cursor-pointer items-center justify-between gap-2 px-3 py-1.5"
            }>
            <span className="text-base">Manage Members</span>
            <IconUsers className="size-4" />
          </ContextMenuItem>
        )}

        {isModerator && (
          <ContextMenuItem
            onClick={() =>
              open("create-channel", {
                server: {
                  _id: serverData._id,
                  name: serverData.name,
                  logo: serverData.logo,
                  inviteCode: serverData.inviteCode,
                  profileId: serverData.profileId,
                  members: serverData.members
                }
              })
            }
            className={
              "flex cursor-pointer items-center justify-between gap-2 px-3 py-1.5"
            }>
            <span className="text-base">Create Channel</span>
            <IconPlus className="size-4" />
          </ContextMenuItem>
        )}

        {isModerator && (
          <ContextMenuItem
            onClick={() =>
              open("create-category", {
                server: {
                  _id: serverData._id,
                  name: serverData.name,
                  logo: serverData.logo,
                  inviteCode: serverData.inviteCode,
                  profileId: serverData.profileId,
                  members: serverData.members
                }
              })
            }
            className={
              "flex cursor-pointer items-center justify-between gap-2 px-3 py-1.5"
            }>
            <span className="text-base">Create Category</span>
            <IconFolderPlus className="size-4" />
          </ContextMenuItem>
        )}

        <Separator className={"my-2"} />

        {isAdmin && (
          <ContextMenuItem
            onClick={() =>
              open("delete-server", {
                server: {
                  _id: serverData._id,
                  name: serverData.name,
                  logo: serverData.logo,
                  inviteCode: serverData.inviteCode,
                  profileId: serverData.profileId,
                  members: serverData.members
                }
              })
            }
            className={cn(
              "flex cursor-pointer items-center justify-between gap-2 px-3 py-1.5 text-red-500",
              "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40"
            )}>
            <span className="text-base">Delete Server</span>
            <IconTrash className="size-4" />
          </ContextMenuItem>
        )}

        {!isAdmin && (
          <ContextMenuItem
            onClick={() =>
              open("leave-server", {
                server: {
                  _id: serverData._id,
                  name: serverData.name,
                  logo: serverData.logo,
                  inviteCode: serverData.inviteCode,
                  profileId: serverData.profileId,
                  members: serverData.members
                }
              })
            }
            className={cn(
              "mt-1 flex cursor-pointer items-center justify-between gap-2 px-3 py-1.5 text-red-500"
            )}>
            <span className="text-base">Leave Server</span>
            <IconTrash className="size-4" />
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}

function ChannelCard({
  channel,
  isModerator,
  isAdmin,
  server,
  className,
  isPrivate
}: {
  channel: Channel;
  server: ServerWithMembersWithProfiles;
  isModerator: boolean;
  isPrivate?: boolean;
  isAdmin: boolean;
  className?: string;
}) {
  const { open } = useModal();
  const param: {
    serverId: string;
    channelId: string;
    memberId?: string;
  } = useParams();

  const Icon = ChannelTypeMap[channel.type];
  return (
    <Link
      href={`/servers/${server._id}/channels/${channel._id}` as Route}
      className={cn(
        "hover:bg-secondary group/channel flex w-full cursor-pointer items-center justify-between space-x-4 rounded-md px-2 py-1",
        param.channelId === channel._id && "bg-secondary",
        className
      )}>
      <div className="text-muted-foreground relative flex items-center gap-2">
        <Icon className="group-hover:text-accent-foreground size-5" />
        {isPrivate && (
          <IconLockFilled
            className={cn(
              "group-hover:text-accent-foreground bg-background group-hover/channel:bg-secondary absolute top-0 left-3 z-1 size-3",
              param.channelId === channel._id && "bg-secondary"
            )}
          />
        )}
        <p className="group-hover:text-accent-foreground">{channel.name}</p>
      </div>

      <div className="flex items-center gap-1.5">
        {isModerator && (
          <ActionTooltip
            size="sm"
            label={"Edit Channel"}
            side="top"
            align="center">
            <IconPencil
              onClick={() =>
                open("edit-channel", {
                  server: {
                    _id: server?._id,
                    name: server?.name,
                    logo: server?.logo,
                    inviteCode: server?.inviteCode,
                    profileId: server?.profileId,
                    members: server?.members
                  },
                  channel
                })
              }
              className="text-muted-foreground hover:text-accent-foreground size-6 cursor-pointer p-0.5 opacity-0 group-hover/channel:opacity-100"
            />
          </ActionTooltip>
        )}
        {isAdmin && (
          <ActionTooltip
            size="sm"
            label={"Delete Channel"}
            side="top"
            align="center">
            <IconTrash
              onClick={() =>
                open("delete-channel", {
                  server: {
                    _id: server?._id,
                    name: server?.name,
                    logo: server?.logo,
                    inviteCode: server?.inviteCode,
                    profileId: server?.profileId,
                    members: server?.members
                  },
                  channel
                })
              }
              className="text-muted-foreground hover:text-accent-foreground size-6 cursor-pointer p-0.5 opacity-0 group-hover/channel:opacity-100"
            />
          </ActionTooltip>
        )}
      </div>
    </Link>
  );
}
