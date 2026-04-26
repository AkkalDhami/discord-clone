import { EmptyFriend } from "@/components/friends/empty-friend";
import { currentAuthUser } from "@/helpers/auth.helper";
import Friendship from "@/models/friendship.model";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Page() {
  const currentUser = await currentAuthUser();

  if (!currentUser) {
    return redirect("/signin");
  }

  const friends = await Friendship.find({
    user: currentUser.id
  });

  if (friends.length === 0) {
    return (
      <div className="mx-auto flex h-[90vh] flex-col items-center justify-center">
        <EmptyFriend />
      </div>
    );
  }

  return redirect("/friends/all");
}
