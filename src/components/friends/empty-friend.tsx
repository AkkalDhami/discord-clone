import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty";
import { IconUserSearch } from "@tabler/icons-react";
import { AddFriendButton } from "@/components/common/add-friend-button";

export function EmptyFriend({
  type = "list"
}: {
  type?: "request" | "list" | "block";
}) {
  const text = {
    block: {
      title: "No blocked friends found!",
      description: "There are no blocked friends."
    },
    list: {
      title: "No friends found!",
      description: "There are no friends."
    },
    request: {
      title: "No friend requests found!",
      description: "There are no friend requests."
    }
  };

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconUserSearch className="size-5" />
        </EmptyMedia>
        <EmptyTitle>{text[type].title}</EmptyTitle>
        <EmptyDescription>{text[type].description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <AddFriendButton />
      </EmptyContent>
    </Empty>
  );
}
