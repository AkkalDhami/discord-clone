import dbConnect from "@/configs/db";
import { currentAuthUser } from "@/helpers/auth.helper";
import Member from "@/models/member.model";
import { Types } from "mongoose";
import { redirect } from "next/navigation";
import { PartialProfile } from "@/types/friend";
import { MobileNavigationSidebar } from "@/components/navigation/navigation-sidebar-sm";
import { ServerEmpty } from "@/components/server/server-empty";
import { ServerCard } from "@/components/server/server-card";

export const dynamic = "force-dynamic";

export type ServerWithStats = {
  _id: Types.ObjectId;
  name: string;
  description: string | null;
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
        description: "$server.description",
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

  return (
    <div className="border-edge ml-1 h-screen border-x pt-4">
      <div className="border-edge border-y px-4 pt-3 pb-6">
        <div className="mb-4 flex flex-row items-center gap-4">
          <MobileNavigationSidebar />
          <h2 className="text-foreground text-2xl font-semibold">
            My Servers - ({servers.length})
          </h2>
        </div>

        {servers.length === 0 ? (
          <ServerEmpty />
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {servers.map(server => {
              return <ServerCard key={server._id.toString()} server={server} />;
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
