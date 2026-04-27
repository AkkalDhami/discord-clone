import { currentAuthUser } from "@/helpers/auth.helper";
import Server from "@/models/server.model";
import {
  Category,
  Channel,
  Member as MemberInterface,
  Profile
} from "@/interface";
import mongoose from "mongoose";
import { redirect } from "next/navigation";
import { ServerHeader } from "./server-header";
import { ServerWithMembersWithProfiles } from "@/types/server";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ServerSection } from "@/components/server/server-section";
import Member from "@/models/member.model";

export const dynamic = "force-dynamic";

export async function ServerSidebar({ serverId }: { serverId: string }) {
  const profile = await currentAuthUser();
  if (!profile) {
    return redirect("/signin");
  }

  const server = await Server.findById(serverId);
  if (!server) {
    return redirect("/");
  }

  const member = await Member.findOne({
    serverId,
    profileId: profile.id
  });

  if (!member) {
    return redirect("/");
  }

  const [serverWithChannels] = await Server.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(serverId)
      }
    },

    {
      $lookup: {
        from: "channels",
        let: { serverId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$serverId", "$$serverId"] },
                  {
                    $or: [
                      { $eq: ["$categoryId", null] },
                      { $not: ["$categoryId"] }
                    ]
                  }
                ]
              }
            }
          }
        ],
        as: "channels"
      }
    },
    {
      $lookup: {
        from: "members",
        localField: "_id",
        foreignField: "serverId",
        as: "members"
      }
    },

    {
      $lookup: {
        from: "categories",
        localField: "_id",
        foreignField: "serverId",
        pipeline: [
          {
            $lookup: {
              from: "channels",
              localField: "_id",
              foreignField: "categoryId",
              as: "channels"
            }
          },
          {
            $lookup: {
              from: "members",
              localField: "privateMembers",
              foreignField: "_id",
              as: "privateMembers",
              pipeline: [
                {
                  $lookup: {
                    from: "profiles",
                    localField: "profileId",
                    foreignField: "_id",
                    as: "profile"
                  }
                },
                {
                  $unwind: {
                    path: "$profile",
                    preserveNullAndEmptyArrays: true
                  }
                }
              ]
            }
          }
        ],
        as: "categories"
      }
    },

    {
      $unwind: {
        path: "$members",
        preserveNullAndEmptyArrays: true
      }
    },

    {
      $lookup: {
        from: "profiles",
        localField: "members.profileId",
        foreignField: "_id",
        as: "profile"
      }
    },

    {
      $unwind: {
        path: "$profile",
        preserveNullAndEmptyArrays: true
      }
    },

    {
      $addFields: {
        "members.profile": "$profile"
      }
    },

    {
      $group: {
        _id: "$_id",
        server: { $first: "$$ROOT" },
        members: { $push: "$members" }
      }
    },

    {
      $addFields: {
        "server.members": "$members"
      }
    },

    {
      $replaceRoot: { newRoot: "$server" }
    },

    {
      $project: {
        profile: 0
      }
    }
  ]);

  if (!serverWithChannels) return null;

  const cleanServer: ServerWithMembersWithProfiles = {
    ...serverWithChannels,
    _id: serverWithChannels._id.toString(),
    channels: serverWithChannels.channels.map((c: Channel) => ({
      ...c,
      _id: c._id.toString(),
      serverId: c.serverId.toString()
    })),
    members: serverWithChannels?.members.map(
      (m: MemberInterface & { profile: Profile }) => ({
        ...m,
        _id: m._id.toString(),
        role: m.role,
        profile: {
          _id: m.profile._id.toString(),
          name: m.profile.name,
          avatar: m.profile.avatar,
          email: m.profile.email
        },
        serverId: m?.serverId?.toString()
      })
    ),
    categories: serverWithChannels.categories.map((c: Category) => ({
      ...c,
      _id: c._id.toString(),
      serverId: c.serverId.toString()
    }))
  };

  const role = cleanServer.members.find(
    member => member.profile._id === profile.id
  )?.role;

  return (
    <div className="text-primary border-edge mb-4 flex h-full w-full flex-col border-r border-l pb-4 md:border-l-0">
      <ServerHeader server={JSON.stringify(cleanServer)} role={role} />
      <ScrollArea className={"h-[calc(100vh-120px)] pb-4"}>
        <ServerSection
          memberId={member._id.toString()}
          role={role}
          server={JSON.stringify(cleanServer)}
        />
      </ScrollArea>
    </div>
  );
}
