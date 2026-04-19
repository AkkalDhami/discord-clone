import { BlockedFriendCard } from "@/components/friends/friend-card";
import { currentAuthUser } from "@/helpers/auth.helper";
import FriendRequest from "@/models/friend-request.model";
import { FriendWithRecieverAndSender } from "@/types/friend";
import { redirect } from "next/navigation";

export default async function Page() {
  const currentUser = await currentAuthUser();

  if (!currentAuthUser) {
    return redirect("/friends");
  }

  const friends = (await FriendRequest.find({
    receiver: currentUser?.id,
    status: "blocked"
  })
    .populate("sender", "username email name _id avatar")
    .populate("receiver", "username email name _id avatar")
    .lean()) as unknown as FriendWithRecieverAndSender[];

  console.log({ friends });

  return (
    <section className="h-full">
      <div className="">
        <h2 className="text-muted-primary border-edge mb-2 border-b p-3.5 font-normal">
          Blocked Friends - {friends.length}
        </h2>
        <div className="grid space-y-2 px-2 sm:grid-cols-2 lg:grid-cols-3">
          {friends.map(f => (
            <BlockedFriendCard key={f._id.toString()} friend={f} />
          ))}
        </div>
      </div>
    </section>
  );
}
