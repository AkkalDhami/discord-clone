import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  IconCalendar,
  IconCategory,
  IconCrownFilled,
  IconHash,
  IconSwords,
  IconUsers
} from "@tabler/icons-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import dbConnect from "@/configs/db";
import { currentAuthUser } from "@/helpers/auth.helper";
import MemberRole from "@/enums/role.enum";
import Member from "@/models/member.model";
import { cn } from "@/lib/utils";
import { removeLeadingEmoji } from "@/utils/remove-leading-emoji";
import { Types } from "mongoose";
import { redirect } from "next/navigation";
import type { Route } from "next";
import { UserAvatar } from "@/components/common/user-avatar";
import { PartialProfile } from "@/types/friend";
import { formatCompactNumber } from "@/utils/num";

export const dynamic = "force-dynamic";

const RoleIconMap: Record<MemberRole, React.ReactNode> = {
  [MemberRole.ADMIN]: <IconCrownFilled className="size-4 text-orange-500" />,
  [MemberRole.MODERATOR]: <IconSwords className="size-4 text-indigo-500" />,
  [MemberRole.GUEST]: null
};

type ServerWithStats = {
  _id: Types.ObjectId;
  name: string;
  logo: string | null;
  createdAt: Date;
  profileId: Types.ObjectId;
  role: string;
  channelCount: number;
  memberCount: number;
  categoryCount: number;
  admin: PartialProfile;
};

export default async function ServersHubPage() {
  const profile = await currentAuthUser();

  if (!profile) {
    return redirect("/signin");
  }

  await dbConnect();

  const servers = await Member.aggregate<ServerWithStats>([
    {
      $match: {
        profileId: new Types.ObjectId(profile.id),
        serverId: { $exists: true, $ne: null }
      }
    },
    {
      $lookup: {
        from: "servers",
        localField: "serverId",
        foreignField: "_id",
        as: "serverArr"
      }
    },
    { $unwind: "$serverArr" },
    {
      $replaceRoot: {
        newRoot: {
          membershipRole: "$role",
          server: "$serverArr"
        }
      }
    },
    {
      $lookup: {
        from: "profiles",
        localField: "server.profileId",
        foreignField: "_id",
        as: "admin",
        pipeline: [
          {
            $project: {
              _id: 1,
              name: 1,
              username: 1,
              avatar: 1,
              email: 1
            }
          }
        ]
      }
    },
    { $unwind: "$admin" },
    {
      $lookup: {
        from: "channels",
        let: { sid: "$server._id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$serverId", "$$sid"] }
            }
          },
          { $count: "value" }
        ],
        as: "_channels"
      }
    },
    {
      $lookup: {
        from: "members",
        let: { sid: "$server._id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$serverId", "$$sid"] },
                  { $ne: ["$serverId", null] }
                ]
              }
            }
          },
          { $count: "value" }
        ],
        as: "_members"
      }
    },
    {
      $lookup: {
        from: "categories",
        let: { sid: "$server._id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$serverId", "$$sid"] }
            }
          },
          { $count: "value" }
        ],
        as: "_categories"
      }
    },
    {
      $project: {
        _id: "$server._id",
        name: "$server.name",
        logo: "$server.logo",
        createdAt: "$server.createdAt",
        profileId: "$server.profileId",
        admin: "$admin",
        role: "$membershipRole",
        channelCount: {
          $ifNull: [
            {
              $getField: {
                field: "value",
                input: { $arrayElemAt: ["$_channels", 0] }
              }
            },
            0
          ]
        },
        memberCount: {
          $ifNull: [
            {
              $getField: {
                field: "value",
                input: { $arrayElemAt: ["$_members", 0] }
              }
            },
            0
          ]
        },
        categoryCount: {
          $ifNull: [
            {
              $getField: {
                field: "value",
                input: { $arrayElemAt: ["$_categories", 0] }
              }
            },
            0
          ]
        }
      }
    },
    { $sort: { name: 1 } }
  ]);

  console.log({ servers });

  return (
    <div className="border-edge ml-1 h-screen border-x py-5 pb-16 md:pb-24">
      <div className="px-4 pt-6 sm:px-6 lg:px-8">
        <h2 className="text-foreground my-2 text-2xl font-semibold">
          My Servers - ({servers.length})
        </h2>

        {servers.length === 0 ? (
          <Card className="border-dashed shadow-none">
            <CardHeader>
              <CardTitle>No servers yet</CardTitle>
              <CardDescription>
                Create one from the sidebar with the plus button, or join with
                an invite link.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {servers.map(server => {
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
                              className="size-8 rounded-lg"
                            />
                            <h3 className="line-clamp-1 text-lg leading-snug font-medium">
                              {server.name}
                            </h3>
                          </div>
                        </div>
                      </div>

                      <div className="border-edge absolute top-3 right-3 rounded-full border p-1">
                        {RoleIconMap[server.role as MemberRole]}
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

                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1">
                          <IconCrownFilled className="size-5 rounded-full border border-orange-500 bg-orange-500/10 p-1 text-orange-500" />
                          <span className="text-muted-primary text-base leading-relaxed font-normal">
                            {server.admin.username}
                          </span>
                        </div>

                        <time
                          dateTime={new Date(server.createdAt).toISOString()}>
                          <span className="text-muted-foreground flex items-center gap-1 text-xs">
                            <IconCalendar
                              className="size-3.5 shrink-0"
                              aria-hidden
                            />
                            {created}
                          </span>
                        </time>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
