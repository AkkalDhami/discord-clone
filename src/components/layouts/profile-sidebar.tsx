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
  IconDotsVertical,
  IconUserPlus
} from "@tabler/icons-react";
import { removeLeadingEmoji } from "@/utils/remove-leading-emoji";
import { UserAvatar } from "../common/user-avatar";
import { PartialProfile } from "@/types/friend";
import { Server } from "@/interface";

type User = Omit<PartialProfile, "email"> & {
  memberSince: string;
};

export type ProfileSidebarProps =
  | {
      type: "direct";
      user: User;
      mutualServers: Server[];
      mutualFriends: User[];
    }
  | {
      type: "group";
      members: User[];
    };

export function ProfileSidebar(props: ProfileSidebarProps) {
  return (
    <div className="border-edge no-scrollbar bg-popover h-full overflow-y-auto">
      {props.type === "direct" ? (
        <DirectProfileSidebar {...props} />
      ) : (
        <GroupSidebar {...props} />
      )}
    </div>
  );
}

function DirectProfileSidebar({
  mutualFriends,
  mutualServers,
  user
}: Extract<
  ProfileSidebarProps,
  {
    type: "direct";
  }
>) {
  return (
    <>
      <div className="relative h-24 bg-linear-to-r from-neutral-300 to-neutral-400 dark:from-neutral-700 dark:to-neutral-800">
        <div className="absolute top-3 right-3 flex gap-2">
          <Button size="icon" variant="secondary" className="rounded-full">
            <IconUserPlus size={16} />
          </Button>
          <Button size="icon" variant="secondary" className="rounded-full">
            <IconDotsVertical size={16} />
          </Button>
        </div>
      </div>

      <div className="space-y-3 px-4 pb-4">
        <div className="-mt-10 flex items-end gap-3">
          <div className="border-edge bg-secondary relative h-20 w-20 overflow-hidden rounded-full border-4">
            {user?.avatar?.url ? (
              <Image
                src={user?.avatar?.url}
                alt="avatar"
                fill
                className="object-cover"
              />
            ) : null}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium">{user.name}</h2>
          <p className="text-muted-foreground text-sm">@{user.username}</p>
        </div>

        <div className="bg-muted rounded-lg p-3">
          <p className="text-muted-primary text-xs font-normal">Member Since</p>
          <p className="mt-1 text-sm">{user.memberSince}</p>
        </div>

        <div className="bg-muted divide-y divide-neutral-500/30 rounded-lg py-2">
          <Collapsible>
            <CollapsibleTrigger
              render={
                <Button
                  variant="ghost"
                  className="text-muted-primary w-full font-normal">
                  Mutual Servers — {mutualServers.length}
                  <IconChevronDown className="ml-auto -rotate-90 group-data-panel-open/button:rotate-0" />
                </Button>
              }
            />

            <CollapsibleContent className="flex w-full flex-col items-start gap-2 bg-transparent p-2.5 pt-0 text-sm">
              <div className="mt-3 w-full space-y-2">
                {mutualServers.map(server => (
                  <div
                    key={server._id}
                    className="flex w-full items-center gap-3 rounded-md p-1.5 duration-300 hover:bg-neutral-200 dark:hover:bg-neutral-800">
                    <div className="bg-primary-500 flex h-10 w-10 items-center justify-center rounded-xl font-normal text-white">
                      {server.logo ? (
                        <Image
                          src={server.logo}
                          alt={server.name}
                          width={40}
                          height={40}
                          className="rounded-xl"
                        />
                      ) : (
                        removeLeadingEmoji(server.name).slice(0, 1)
                      )}
                    </div>
                    <p>{server.name}</p>
                  </div>
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
                  Mutual Friends — {mutualFriends.length}
                  <IconChevronDown className="ml-auto -rotate-90 group-data-panel-open/button:rotate-0" />
                </Button>
              }
            />

            <CollapsibleContent className="flex w-full flex-col items-start gap-2 bg-transparent p-2.5 pt-0 text-sm">
              <div className="mt-3 w-full space-y-2">
                {mutualFriends.map(f => (
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
  members
}: Extract<ProfileSidebarProps, { type: "group" }>) {
  return (
    <>
      <Section title={`Members (${members.length})`}>
        {members.map(m => (
          <div
            key={m._id}
            className="flex w-full items-center gap-3 rounded-md p-1.5 duration-300 hover:bg-neutral-200 dark:hover:bg-neutral-800">
            <UserAvatar src={m.avatar?.url} name={m.name} />
            <div>
              <p>{m.name}</p>
              <p className="text-muted-foreground text-xs">@{m.username}</p>
            </div>
          </div>
        ))}
      </Section>
    </>
  );
}

function Section({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
        {title}
      </p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}
