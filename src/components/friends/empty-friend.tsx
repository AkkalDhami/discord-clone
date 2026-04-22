"use client";

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
import { Button } from "@/components/ui/button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Route } from "next";

export function EmptyFriend({
  type = "list"
}: {
  type?: "request" | "list" | "block" | "search";
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const params = new URLSearchParams(searchParams.toString());


  function clearSearch() {
    params.delete("q");
    router.replace(`${pathname}?${params.toString()}` as Route);
    return;
  }

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
    },
    search: {
      title: "No results found",
      description:
        "No results found for your search. Try adjusting your search terms."
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
        {type === "search" ? (
          <Button onClick={clearSearch}>Clear Search</Button>
        ) : (
          <AddFriendButton />
        )}
      </EmptyContent>
    </Empty>
  );
}
