import { currentAuthUser } from "@/helpers/auth.helper";
import { Member as MemberInterface } from "@/interface";
import Member from "@/models/member.model";
import Server from "@/models/server.model";
import { Types } from "mongoose";
import { redirect } from "next/navigation";
import { MemberItem } from "@/components/member/member-item";
import { IconUsers } from "@tabler/icons-react";

export async function MemberSidebar({ serverId }: { serverId: string }) {
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

  const members: MemberInterface[] | null = await Member.aggregate([
    {
      $match: {
        serverId: new Types.ObjectId(serverId)
      }
    },
    {
      $sort: {
        createdAt: -1
      }
    },
    {
      $lookup: {
        from: "profiles",
        pipeline: [
          {
            $project: {
              username: 1,
              avatar: 1,
              name: 1,
              _id: 1,
              email: 1
            }
          }
        ],
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
  ]);

  return (
    <div className="bg-background flex h-full flex-col">
      <h2 className="border-edge flex items-center gap-2 border-y py-3 pl-4 text-lg">
        <IconUsers className="size-4" /> Members ({members?.length})
      </h2>
      <div className="mt-2 flex flex-col space-y-1">
        {members?.map(member => (
          <MemberItem
            key={member._id}
            member={JSON.stringify(member)}
            userId={profile.id}
          />
        ))}
      </div>
    </div>
  );
}
