"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { useConversation } from "@/hooks/use-conversaton";
import { UserAvatar } from "./user-avatar";
import Link from "next/link";

export function SearchConversation() {
  const { searchConversationData, isSearchConversationLoading } =
    useConversation();
  const [open, setOpen] = useState(false);

  const items = searchConversationData?.data || [];

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(open => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <div className="flex w-full flex-col gap-4 px-2">
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="w-full">
        Find or start a conversation
      </Button>
      <CommandDialog
        open={open && !isSearchConversationLoading}
        onOpenChange={setOpen}
        className="w- max-w-lg">
        <Command>
          <CommandInput placeholder="Where would you like to go?" />
          <CommandList className="mt-3">
            <CommandEmpty>No results found.</CommandEmpty>
            {items.map(item => (
              <CommandItem
                key={item._id}
                onClick={() => setOpen(false)}
                className="mt-1 cursor-pointer p-2">
                <Link
                  href={`/conversations/${item._id}`}
                  className="flex items-center gap-2">
                  <UserAvatar
                    name={item.name}
                    src={item.logo}
                    className="size-7"
                  />
                  {item.type === "direct" ? `@${item.name}` : item.name}
                </Link>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
}
