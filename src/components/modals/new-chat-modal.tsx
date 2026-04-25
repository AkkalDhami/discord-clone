"use client";

import { useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";
import { UserAvatar } from "@/components/common/user-avatar";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IconCheck, IconX } from "@tabler/icons-react";
import { PartialProfile } from "@/types/friend";
import { ConversationType } from "@/validators/conversation";
import toast from "react-hot-toast";
import { useConversation } from "@/hooks/use-conversaton";
import { useRouter } from "next/navigation";

const MAX = 10;

export function NewChatModal() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const [selected, setSelected] = useState<PartialProfile[]>([]);
  const [groupName, setGroupName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { createConversation, isConversationCreating } = useConversation();

  const { isOpen, type, close, data } = useModal();
  const isModalOpen = isOpen && type === "new-chat";

  const { friends, user } = data;

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

  const handleSubmit = async () => {
    const payload: ConversationType = {
      type: isGroup ? "group" : "direct",
      participants: selected.map(u => u._id),
      name: groupName,
      admin: user?._id as string
    };
    try {
      const res = await createConversation(payload);
      if (res.success) {
        toast.success(res.message || "Conversation removed successfully");
        handleClose();
        router.push(`/conversations/${res?.data?._id}`);
        router.refresh();
      } else {
        toast.error(res.message || "Failed to create conversation");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to create conversation");
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={open => !open && handleClose()}>
      <DialogContent className="text-accent-foreground w-full max-w-md gap-0 p-0">
        {/* Header */}
        <DialogHeader className="px-5 py-4">
          <DialogTitle className="text-base font-medium">New chat</DialogTitle>
          <p className="text-muted-foreground text-sm">
            {selected.length === 0
              ? `Select up to ${MAX} friends`
              : `${MAX - selected.length} more can be added`}
          </p>
        </DialogHeader>

        <div className="px-5 py-3">
          <div
            className="border-edge focus-within:ring-primary-500 flex cursor-text flex-wrap items-center gap-1.5 rounded-md border px-2.5 py-2 focus-within:ring-2"
            onClick={() => inputRef.current?.focus()}>
            {selected.map(u => (
              <div
                key={u._id}
                className="bg-secondary flex items-center gap-1 rounded-md border px-1 py-0.5 text-xs">
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
              </div>
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
                        ? "bg-primary-500 border-transparent"
                        : "border-border bg-transparent"
                    )}>
                    {sel && (
                      <IconCheck
                        className="size-2.5 text-white"
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
            {isConversationCreating ? (
              <>
                <Spinner /> Creating...
              </>
            ) : isGroup ? (
              "Create group chat"
            ) : (
              "Create chat"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
