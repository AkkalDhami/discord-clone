"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

import { IconX, IconUsers, IconPencil } from "@tabler/icons-react";
import { useModal } from "@/hooks/use-modal-store";
import { UserAvatar } from "@/components/common/user-avatar";

type Friend = {
  id: string;
  name: string;
  username: string;
  avatar?: { url: string };
};

const mockFriends: Friend[] = [
  {
    id: "1",
    name: "akkal dhami",
    username: "akkal12"
  },
  {
    id: "2",
    name: "Pratap",
    username: "pratap0245"
  }
];

export function NewChatDialog() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Friend[]>([]);
  const [groupName, setGroupName] = useState("");

  const { isOpen, type, close } = useModal();
  const isModalOpen = isOpen && type === "new-chat";
  const filtered = useMemo(() => {
    return mockFriends.filter(
      f =>
        f.name.toLowerCase().includes(query.toLowerCase()) ||
        f.username.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  const toggleUser = (user: Friend) => {
    setSelected(prev => {
      const exists = prev.find(u => u.id === user.id);
      if (exists) {
        return prev.filter(u => u.id !== user.id);
      }
      return [...prev, user];
    });
  };

  const removeUser = (id: string) => {
    setSelected(prev => prev.filter(u => u.id !== id));
  };

  const isSelected = (id: string) => selected.some(u => u.id === id);

  const isGroup = selected.length > 1;

  function onOpenChange() {
    console.log("first");
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={onOpenChange}>
      <DialogContent className="text-accent-foreground max-w-lg overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-lg font-semibold">
            New Message
          </DialogTitle>
          <p className="text-muted-foreground text-sm">
            You can add {10 - selected.length} more friends.
          </p>
        </DialogHeader>

        <div className="mt-4 px-6">
          <div className="focus-within:ring-primary-500 flex flex-wrap items-center gap-2 rounded-lg border border-neutral-500/30 px-3 py-2 focus-within:ring-2">
            {selected.map(user => (
              <div
                key={user.id}
                className="flex items-center gap-1 rounded-md border px-2 py-1 text-sm">
                {user.name}
                <button onClick={() => removeUser(user.id)}>
                  <IconX className="size-3 cursor-pointer" />
                </button>
              </div>
            ))}

            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search friends..."
              className="flex-1 bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        <ScrollArea className="mt-4 max-h-64 px-2">
          <div className="space-y-1 px-4">
            {filtered.map(friend => (
              <div
                key={friend.id}
                onClick={() => toggleUser(friend)}
                className={`text-accent-foreground flex cursor-pointer items-center justify-between rounded-md p-2 transition ${
                  isSelected(friend.id)
                    ? "bg-secondary"
                    : "hover:bg-secondary/60"
                }`}>
                <div className="flex items-center gap-3">
                  <UserAvatar name={friend.name} src={friend?.avatar?.url} />
                </div>

                <Checkbox checked={isSelected(friend.id)} />
              </div>
            ))}
          </div>
        </ScrollArea>

        {isGroup && (
          <div className="border-t border-zinc-800 px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="bg-primary flex h-12 w-12 items-center justify-center rounded-full">
                  <IconUsers size={20} />
                </div>

                <div className="absolute right-0 bottom-0 rounded-full bg-zinc-700 p-1">
                  <IconPencil size={12} />
                </div>
              </div>

              <div className="flex-1">
                <p className="mb-1 text-sm text-muted-foreground">
                  Group Name (optional)
                </p>
                <Input
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  placeholder={selected.map(s => s.name).join(", ")}
                  className="border-edge"
                />
              </div>
            </div>
          </div>
        )}

        <div className="border-edge flex justify-end gap-3 border-t px-6 py-4">
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>

          <Button disabled={selected.length === 0} variant={"primary"}>
            {isGroup ? "Create Group Message" : "Create Message"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
