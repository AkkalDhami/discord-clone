"use client";

import { useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";
import { UserAvatar } from "@/components/common/user-avatar";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IconCheck, IconX } from "@tabler/icons-react";
import { PartialProfile } from "@/types/friend";

const MAX = 10;

export function NewChatDialog2() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<PartialProfile[]>([]);
  const [groupName, setGroupName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { isOpen, type, close, data } = useModal();
  const isModalOpen = isOpen && type === "new-chat";

  const { friends } = data;

  const isGroup = selected.length > 1;

  const filtered = useMemo(
    () =>
      friends?.filter(
        f =>
          f?.name.toLowerCase().includes(query.toLowerCase()) ||
          f?.username.toLowerCase().includes(query.toLowerCase())
      ),
    [query, friends]
  );

  console.log({
    friends
  });

  const isSelected = (id: string) => selected.some(u => u._id === id);

  const toggle = (friend: PartialProfile) => {
    setSelected(prev => {
      const exists = prev.find(u => u._id === friend._id);
      if (exists) return prev.filter(u => u._id !== friend._id);
      if (prev.length >= MAX) return prev;
      return [...prev, friend];
    });
  };

  const remove = (id: string) =>
    setSelected(prev => prev.filter(u => u._id !== id));

  const reset = () => {
    setSelected([]);
    setQuery("");
    setGroupName("");
  };

  const handleClose = () => {
    close();
    reset();
  };

  const handleSubmit = () => {
    const payload = {
      type: isGroup ? "GROUP" : "DM",
      members: selected.map(u => u._id),
      groupName: isGroup ? groupName || null : null
    };
    console.log(payload);
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={open => !open && handleClose()}>
      <DialogContent className="text-accent-foreground w-full max-w-md gap-0 p-0">
        {/* Header */}
        <DialogHeader className="border-border border-b px-5 py-4">
          <DialogTitle className="text-base font-medium">New chat</DialogTitle>
          <p className="text-muted-foreground text-sm">
            {selected.length === 0
              ? `Select up to ${MAX} friends`
              : `${MAX - selected.length} more can be added`}
          </p>
        </DialogHeader>

        {/* Search + chips */}
        <div className="px-5 py-3">
          <div
            className="border-border focus-within:ring-primary-500 flex cursor-text flex-wrap items-center gap-1.5 rounded-md border px-2.5 py-2 focus-within:ring-2"
            onClick={() => inputRef.current?.focus()}>
            {selected.map(u => (
              <span
                key={u._id}
                className="bg-secondary flex items-center gap-1 rounded-md px-1 py-0.5 text-xs">
                {u.name}
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    remove(u._id);
                  }}
                  className="text-muted-foreground hover:text-foreground cursor-pointer">
                  <IconX className="size-3" />
                </button>
              </span>
            ))}
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={selected.length === 0 ? "Search friends..." : ""}
              className="placeholder:text-muted-foreground min-w-20 flex-1 bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        <ScrollArea className="h-52 px-3">
          <div className="space-y-1">
            {filtered?.map(friend => {
              const sel = isSelected(friend._id);
              return (
                <div
                  key={friend._id}
                  onClick={() => toggle(friend)}
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-md px-2.5 py-2 transition-colors",
                    sel ? "bg-secondary" : "hover:bg-secondary/60"
                  )}>
                  <div className="flex items-center gap-2.5">
                    <UserAvatar name={friend.name} src={friend.avatar?.url} />
                    <div>
                      <p className="text-sm">{friend.name}</p>
                      <p className="text-muted-foreground text-xs">
                        @{friend.username}
                      </p>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "flex size-4 items-center justify-center rounded border transition-colors",
                      sel
                        ? "bg-foreground border-transparent"
                        : "border-border bg-transparent"
                    )}>
                    {sel && (
                      <IconCheck
                        className="text-background size-2.5"
                        strokeWidth={3}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {isGroup && (
          <div className="border-border border-t px-5 py-3">
            <p className="text-muted-foreground mb-1.5 text-xs">
              Group name <span className="opacity-60">(optional)</span>
            </p>
            <Input
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              placeholder={selected.map(u => u.name.split(" ")[0]).join(", ")}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 px-5 pt-3 pb-5">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={"primary"}
            disabled={selected.length === 0}
            onClick={handleSubmit}>
            {isGroup ? "Create group chat" : "Create chat"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
