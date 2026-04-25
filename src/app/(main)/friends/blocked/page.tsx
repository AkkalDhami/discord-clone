import { EmptyFriend } from "@/components/friends/empty-friend";
import { BlockedFriendCard } from "@/components/friends/friend-card";
import { FriendSearch } from "@/components/friends/friend-search";
import dbConnect from "@/configs/db";
import { currentAuthUser } from "@/helpers/auth.helper";

import Friendship from "@/models/friendship.model";
import { PartialFriendship } from "@/types/friend";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Page(props: PageProps<"/friends/blocked">) {
  const currentUser = await currentAuthUser();

  const searchParams: { q?: string } = await props.searchParams;

  if (!currentUser) {
    return redirect("/signin");
  }
  
  const q = searchParams?.q?.trim() || "";

  const searchMatch = q
    ? {
        $or: [
          { username: { $regex: q, $options: "i" } },
          { name: { $regex: q, $options: "i" } },
          { email: { $regex: q, $options: "i" } }
        ]
      }
    : {};


  await dbConnect();

  const rawData = await Friendship.find({
    user: currentUser?.id,
    status: "blocked"
  })
    .populate({
      path: "friend",
      match: searchMatch,
      select: "username name email _id avatar"
    })
    .sort({ createdAt: -1 })
    .lean();

  const friends = rawData.filter(
    r => r.friend
  ) as unknown as PartialFriendship[];

  return (
    <section className="h-full">
      {friends.length === 0 ? (
        q ? (
          <EmptyFriend type="search" />
        ) : (
          <EmptyFriend type="block" />
        )
      ) : (
        <>
          <div className="border-edge border-b px-2 py-2">
            <FriendSearch />
          </div>
          <h2 className="text-muted-primary border-edge mb-2 border-b p-2.5 font-normal">
            Blocked Friends - {friends.length}
          </h2>
          <div className="border-edge divide-y border-t">
            {friends.map(f => (
              <BlockedFriendCard
                userId={currentUser.id}
                key={f._id.toString()}
                friend={JSON.stringify(f)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
