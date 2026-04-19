import { AddFriendButton } from "@/components/common/add-friend-button";
import { currentAuthUser } from "@/helpers/auth.helper";
import Friendship from "@/models/friendship.model";
import { redirect } from "next/navigation";

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
        <div className="max-w-md space-y-5 text-center">
          <p className="text-muted-secondary text-pretty">
            There are no friends . Check back later!
          </p>
          <AddFriendButton />
        </div>
      </div>
    );
  }
}
