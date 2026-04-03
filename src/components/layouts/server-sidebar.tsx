import ChannelType from "@/enums/channel.enum";
import { currentAuthUser } from "@/helpers/auth.helper";
import { IChannel } from "@/models/channel.model";
import { IMember } from "@/models/member.model";
import Server from "@/models/server.model";
import mongoose from "mongoose";
import { redirect } from "next/navigation";
import { ServerHeader } from "./server-header";
import { Channel, Member } from "@/interface";

export async function ServerSidebar({ serverId }: { serverId: string }) {
  const profile = await currentAuthUser();
  if (!profile) {
    return redirect("/signin");
  }

  const server = await Server.findById(serverId);
  if (!server) {
    return redirect("/");
  }

  // const [serverWithChannels] = await Server.aggregate([
  //   {
  //     $match: {
  //       _id: new mongoose.Types.ObjectId(serverId)
  //     }
  //   },
  //   {
  //     $lookup: {
  //       from: "channels",
  //       localField: "_id",
  //       foreignField: "serverId",
  //       as: "channels"
  //     }
  //   },
  //   {
  //     $lookup: {
  //       from: "members",
  //       localField: "_id",
  //       foreignField: "serverId",
  //       as: "members"
  //     }
  //   },

  //   // {
  //   //   $unwind: "$channels"
  //   // },
  //   {
  //     $unwind: "$members"
  //   },

  //   {
  //     $group: {
  //       _id: "$_id",
  //       name: { $first: "$name" },
  //       logo: { $first: "$logo" },

  //       members: {
  //         $push: "$members"
  //       }
  //     }
  //   }
  // ]);

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
    }
  ]);

  const cleanServer = {
    ...serverWithChannels,
    _id: serverWithChannels._id.toString(),
    channels: serverWithChannels.channels.map((c: IChannel) => ({
      ...c,
      _id: c._id.toString(),
      serverId: c.serverId.toString()
    })),
    members: serverWithChannels.members.map((m: IMember) => ({
      ...m,
      _id: m._id.toString(),
      profileId: m?.profileId?.toString(),
      serverId: m?.serverId?.toString()
    }))
  };

  console.log({
    cleanServer,
    serverWithChannels: serverWithChannels.members
  });

  const textChannels = cleanServer.channels.filter(
    (channel: Channel) => channel.type === ChannelType.TEXT
  );

  const audioChannels = cleanServer.channels.filter(
    (channel: Channel) => channel.type === ChannelType.AUDIO
  );

  const videoChannels = cleanServer.channels.filter(
    (channel: Channel) => channel.type === ChannelType.VIDEO
  );

  const role = cleanServer.members.find(
    (member: Member) => member.profileId.toString() === profile.id
  )?.role;

  return (
    <div className="text-primary flex w-full flex-col bg-neutral-100 p-3 pt-6 dark:bg-neutral-950">
      <ServerHeader server={cleanServer} role={role} />
    </div>
  );
}
