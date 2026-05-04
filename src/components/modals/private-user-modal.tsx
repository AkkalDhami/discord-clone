"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";
import { UserAvatar } from "@/components/common/user-avatar";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IconCheck, IconX } from "@tabler/icons-react";
import { PartialProfile } from "@/types/friend";
import toast from "react-hot-toast";
import { useMessage } from "@/hooks/use-message";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user-store";
import { Textarea } from "@/components/ui/textarea";

export function PrivateUserModal() {
  const [query, setQuery] = useState("");
  const [content, setContent] = useState("");

  const { createMessage } = useMessage();

  const queryClient = useQueryClient();
  const router = useRouter();

  const [selected, setSelected] = useState<PartialProfile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const { setPrivateUsers } = useUser();

  const { isOpen, type, close, data } = useModal();
  const isModalOpen = isOpen && type === "private-user";

  const { privateMessage } = data;

  useEffect(() => {
    if (privateMessage?.content !== undefined) {
      requestAnimationFrame(() => {
        setContent(privateMessage.content ?? "");
      });
    }
  }, [privateMessage?.content]);

  const friends = privateMessage?.participants;

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
      const next = prev.some(u => u._id === friend._id)
        ? prev.filter(u => u._id !== friend._id)
        : [...prev, friend];
      setPrivateUsers(next);
      return next;
    });
  };

  const remove = (id: string) => {
    setSelected(prev => {
      const next = prev.filter(u => u._id !== id);
      setPrivateUsers(next);
      return next;
    });
  };

  const reset = () => {
    setSelected([]);
    setQuery("");
    setContent("");
  };

  const handleClose = () => {
    close();
    reset();
  };

  if (!privateMessage) {
    return;
  }

  const handleSubmit = async () => {
    handleClose();
    try {
      const res = await createMessage({
        content,
        conversationId: privateMessage?.conversationId,
        privateUsers: selected.map(u => u._id)
      });

      if (res.success) {
        await queryClient.invalidateQueries({
          queryKey: ["messages", privateMessage?.conversationId]
        });
        router.refresh();
        requestAnimationFrame(() => {
          const container = document.getElementById("messages-container");
          container?.scrollTo({
            top: container?.scrollHeight ?? 0,
            behavior: "smooth"
          });
        });
        return;
      } else {
        toast.error(res.message || "Failed to send message");
        return;
      }
    } catch (error) {
      console.error({ error });
      toast.error((error as Error).message || "Failed to send message");
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={open => !open && handleClose()}>
      <DialogContent className="text-accent-foreground w-full max-w-md gap-0 p-0">
        {/* Header */}
        <DialogHeader className="px-5 py-4">
          <DialogTitle className="text-base font-medium">
            Send Private Message
          </DialogTitle>
        </DialogHeader>
        {privateMessage.content ? (
          <>
            <div className="px-6">
              {privateMessage.content !== undefined && (
                <div className="mb-3 rounded-lg">
                  <p className="text-muted-foreground mb-1 text-sm">
                    Message you are sending privately:
                  </p>

                  <Textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    className="mt-1 h-auto min-h-16 resize-none border-none bg-transparent p-2 text-sm outline-none"
                  />
                </div>
              )}
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

            <ScrollArea className="mt-3 h-52 px-6">
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
                        <UserAvatar
                          name={friend.name}
                          src={friend.avatar?.url}
                        />
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

            <div className="grid grid-cols-2 gap-2 px-5 pt-3 pb-5">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="button"
                variant={"primary"}
                disabled={selected.length === 0 || content.trim().length === 0}
                onClick={handleSubmit}>
                Send Message
              </Button>
            </div>
          </>
        ) : (
          <p className="text-destructive mb-4 px-6">
            No private message to send. Write a message first.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
