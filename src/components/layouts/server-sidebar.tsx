import ChannelType from "@/enums/channel.enum";
import { currentAuthUser } from "@/helpers/auth.helper";
import Server from "@/models/server.model";
import { Category, Channel, Member, Profile } from "@/interface";
import mongoose from "mongoose";
import { redirect } from "next/navigation";
import { ServerHeader } from "./server-header";
import { ServerWithMembersWithProfiles } from "@/types/server";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ServerSection } from "@/components/server/server-section";

export async function ServerSidebar({ serverId }: { serverId: string }) {
  const profile = await currentAuthUser();
  if (!profile) {
    return redirect("/signin");
  }

  const server = await Server.findById(serverId);
  if (!server) {
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
        localField: "_id",
        foreignField: "serverId",
        as: "channels",
        pipeline: [
          {
            $lookup: {
              from: "categories",
              localField: "categoryId",
              foreignField: "_id",
              as: "category"
            }
          },
          {
            $unwind: {
              path: "$category",
              preserveNullAndEmptyArrays: true
            }
          }
        ]
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
            $unwind: {
              path: "$channels",
              preserveNullAndEmptyArrays: true
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

  console.log({
    serverWithChannels,
    ch: serverWithChannels.channels
  });
  const cleanServer: ServerWithMembersWithProfiles = {
    ...serverWithChannels,
    _id: serverWithChannels._id.toString(),
    channels: serverWithChannels.channels.map((c: Channel) => ({
      ...c,
      _id: c._id.toString(),
      serverId: c.serverId.toString()
    })),
    members: serverWithChannels?.members.map(
      (m: Member & { profile: Profile }) => ({
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

  // console.log({
  //   cleanServer
  // });

  const textChannels = cleanServer.channels.filter(
    (channel: Channel) => channel.type === ChannelType.TEXT
  );

  const audioChannels = cleanServer.channels.filter(
    (channel: Channel) => channel.type === ChannelType.AUDIO
  );

  const videoChannels = cleanServer.channels.filter(
    (channel: Channel) => channel.type === ChannelType.VIDEO
  );

  // console.log({
  //   textChannels,
  //   audioChannels,
  //   videoChannels
  // });

  const role = cleanServer.members.find(
    (member: Member) => member.profileId.toString() === profile.id
  )?.role;

  return (
    <div className="text-primary flex h-full w-full flex-col">
      <ServerHeader server={JSON.stringify(cleanServer)} role={role} />
      <ScrollArea>
        <ServerSection
          sectionType="channels"
          label="Text Channels"
          channelType={ChannelType.TEXT}
          role={role}
          // server={cleanServer}
        />
      </ScrollArea>
    </div>
  );
}
