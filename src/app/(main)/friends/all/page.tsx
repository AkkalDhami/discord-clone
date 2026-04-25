import { EmptyFriend } from "@/components/friends/empty-friend";
import { FriendCard } from "@/components/friends/friend-card";
import { FriendSearch } from "@/components/friends/friend-search";
import { SortFriend } from "@/components/friends/sort-friend";
import dbConnect from "@/configs/db";
import { currentAuthUser } from "@/helpers/auth.helper";

import Friendship from "@/models/friendship.model";
import { PartialFriendship } from "@/types/friend";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Page(props: PageProps<"/friends/all">) {
  const currentUser = await currentAuthUser();

  const searchParams: { q?: string; sort?: string } = await props.searchParams;

  const q = typeof searchParams?.q === "string" ? searchParams.q.trim() : "";
  const sort =
    typeof searchParams?.sort === "string"
      ? searchParams.sort.trim()
      : "default";

  const searchMatch = q
    ? {
        $or: [
          { username: { $regex: q, $options: "i" } },
          { name: { $regex: q, $options: "i" } },
          { email: { $regex: q, $options: "i" } }
        ]
      }
    : {};

  if (!currentUser) {
    return redirect("/");
  }

  await dbConnect();

  const rawData = await Friendship.find({
    user: currentUser?.id,
    status: "active"
  })
    .populate({
      path: "friend",
      match: searchMatch,
      select: "username name email _id avatar"
    })
    .sort({ createdAt: sort === "oldest" ? 1 : -1 })
    .lean();

  const friends = rawData.filter(
    r => r.friend
  ) as unknown as PartialFriendship[];

  return (
    <section className="h-full">
      {friends.length > 0 ? (
        <>
          <div className="border-edge border-b px-2 py-2">
            <div className="flex items-center gap-2">
              <FriendSearch className="flex-1" />
              <SortFriend />
            </div>
          </div>
          <h2 className="text-muted-primary border-edge mb-2 border-b p-2.5 font-normal">
            All Friends - {friends.length}
          </h2>
          <div className="divide-edge border-edge divide-y border-t">
            {friends.map(f => (
              <FriendCard key={f._id.toString()} friend={JSON.stringify(f)} />
            ))}
          </div>
        </>
      ) : (
        <EmptyFriend />
      )}
    </section>
  );
}
