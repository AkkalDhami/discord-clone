import { FriendCard } from "@/components/friends/friend-card";
import dbConnect from "@/configs/db";
import { currentAuthUser } from "@/helpers/auth.helper";
import Friendship from "@/models/friendship.model";
import { PopulatedFriendship } from "@/types/friend";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Page() {
  const currentUser = await currentAuthUser();

  if (!currentAuthUser) {
    return redirect("/friends");
  }

  await dbConnect();

  const friends = (await Friendship.find({
    user: currentUser?.id
  })
    .populate("friend", "username email name _id avatar")
    .populate("user", "username email name _id avatar")
    .lean()) as unknown as PopulatedFriendship[];

  return (
    <section className="h-full">
      <div className="">
        <h2 className="text-muted-primary border-edge mb-2 border-b p-3.5 font-normal">
          Friends - {friends.length}
        </h2>
        <div className="grid space-y-2 px-2">
          {friends.map(f => (
            <FriendCard key={f._id.toString()} friend={f} />
          ))}
        </div>
      </div>
    </section>
  );
}
