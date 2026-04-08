import { currentAuthUser } from "@/helpers/auth.helper";
import { Member as MemberInterface } from "@/interface";
import Member from "@/models/member.model";
import Server from "@/models/server.model";
import { Types } from "mongoose";
import { redirect } from "next/navigation";
import { MemberItem } from "@/components/member/member-item";

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
    <div className="flex flex-col">
      <h2 className="border-edge border-y py-3 pl-4 text-lg font-medium">
        Members
      </h2>
      <div className="flex flex-col space-y-2 px-2 py-4">
        {members?.map(member => (
          <div key={member._id}>
            <MemberItem member={member} />
          </div>
        ))}
      </div>
    </div>
  );
}
