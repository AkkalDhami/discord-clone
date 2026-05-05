import { ServerWithStats } from "@/app/(main)/servers/page";
import {
  IconCalendar,
  IconCategory,
  IconCrownFilled,
  IconHash,
  IconSwords,
  IconUser,
  IconUsers
} from "@tabler/icons-react";
import MemberRole from "@/enums/role.enum";
import { cn } from "@/lib/utils";
import { removeLeadingEmoji } from "@/utils/remove-leading-emoji";
import type { Route } from "next";
import { UserAvatar } from "@/components/common/user-avatar";
import { formatCompactNumber } from "@/utils/num";
import { ActionTooltip } from "@/components/common/action-tooltip";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

const RoleIconMap: Record<MemberRole, React.ReactNode> = {
  [MemberRole.ADMIN]: <IconCrownFilled className="size-4 text-orange-500" />,
  [MemberRole.MODERATOR]: <IconSwords className="size-4 text-indigo-500" />,
  [MemberRole.GUEST]: <IconUser className="size-4 text-neutral-500" />
};

export function ServerCard({ server }: { server: ServerWithStats }) {
  const href = `/servers/${server._id.toString()}` as Route;
  const nameWithoutEmoji = removeLeadingEmoji(server.name);

  const created = formatDistanceToNow(new Date(server.createdAt), {
    addSuffix: true
  });

  return (
    <li key={server._id.toString()}>
      <Link href={href} className="relative h-full">
        <div
          className={cn(
            "bg-secondary/40 hover:bg-muted/50 relative h-full gap-4 space-y-1.5 rounded-lg border-transparent p-4"
          )}>
          <div className="flex-row gap-4">
            <div className="relative shrink-0">
              <div className="flex items-center gap-2">
                <UserAvatar
                  rounded="lg"
                  src={server.logo || ""}
                  name={nameWithoutEmoji}
                  className="size-10 rounded-lg"
                />
                <div className="flex flex-col">
                  <h3 className="line-clamp-1 text-lg leading-snug font-medium">
                    {server.name}
                  </h3>
                  {server.description && (
                    <p className="text-muted-foreground line-clamp-1 text-sm">
                      {server.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="border-edge absolute top-3 right-3 flex size-8 items-center justify-center rounded-full border p-1">
            <ActionTooltip label={server.role} size="sm" side="top">
              {RoleIconMap[server.role as MemberRole]}
            </ActionTooltip>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-1">
            <div className="flex items-center gap-1.5">
              <IconUsers
                className="text-muted-foreground bg-secondary size-9 rounded-lg p-2"
                stroke={1.5}
                aria-hidden
              />
              <div className="flex flex-col gap-0">
                <span className="text-muted-foreground text-[11px] font-normal uppercase">
                  Members
                </span>
                <span className="text-base font-normal tabular-nums">
                  {formatCompactNumber(server.memberCount)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 py-3">
              <IconHash
                className="text-muted-foreground bg-secondary size-9 rounded-lg p-2"
                stroke={1.5}
                aria-hidden
              />
              <div className="flex flex-col gap-0">
                <span className="text-muted-foreground text-[11px] font-normal uppercase">
                  Channels
                </span>
                <span className="text-base font-normal tabular-nums">
                  {formatCompactNumber(server.channelCount)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 py-3">
              <IconCategory
                className="text-muted-foreground bg-secondary size-9 rounded-lg p-2"
                stroke={1.5}
                aria-hidden
              />
              <div className="flex flex-col gap-0">
                <span className="text-muted-foreground text-[11px] font-normal uppercase">
                  Categories
                </span>
                <span className="text-base font-normal tabular-nums">
                  {formatCompactNumber(server.categoryCount)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-1">
            <div className="flex items-center gap-1">
              <IconCrownFilled className="size-5 rounded-full border border-orange-500 bg-orange-500/10 p-1 text-orange-500" />
              <span className="text-muted-primary text-base leading-relaxed font-normal">
                @{server.admin.username}
              </span>
            </div>

            <time dateTime={new Date(server.createdAt).toISOString()}>
              <span className="text-muted-foreground flex items-center gap-1 text-xs">
                <IconCalendar className="size-3.5 shrink-0" aria-hidden />
                {created}
              </span>
            </time>
          </div>
        </div>
      </Link>
    </li>
  );
}
