import { FriendCard } from "@/components/friends/friend-card";
import { currentAuthUser } from "@/helpers/auth.helper";
import { Friendship as IFriendship } from "@/interface";
import Friendship from "@/models/friendship.model";
import { redirect } from "next/navigation";

export default async function Page() {
  const currentUser = await currentAuthUser();

  if (!currentAuthUser) {
    return redirect("/friends");
  }

  const friends = await Friendship.find({
    user: currentUser?.id
  })
    .populate("friend", "username email name _id avatar")
    .populate("user", "username email name _id avatar")
    .lean();

  console.log({ friends });

  const mappedFriends: IFriendship[] = friends.map(f => ({
    ...f,
    _id: f._id.toString(),
    friend: {
      ...f.friend,
      _id: f.friend._id.toString()
    },
    user: {
      ...f.user,
      _id: f.user._id.toString()
    }
  }));

  return (
    <section className="h-full">
      <div className="">
        <h2 className="text-muted-primary border-edge mb-2 border-b p-3.5 font-normal">
          Friends - {friends.length}
        </h2>
        <div className="grid space-y-2 px-2">
          {mappedFriends.map(f => (
            <FriendCard key={f._id.toString()} friend={f} />
          ))}
        </div>
      </div>
    </section>
  );
}
