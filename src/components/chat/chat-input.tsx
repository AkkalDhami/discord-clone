/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ChatInputSchema, ChatInputType } from "@/validators/chat";

import { Field, FieldGroup } from "@/components/ui/field";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea
} from "@/components/ui/input-group";

import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";

import {
  EmojiPicker,
  EmojiPickerSearch,
  EmojiPickerContent,
  EmojiPickerFooter
} from "@/components/ui/emoji-picker";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  IconMoodSmile,
  IconPlus,
  IconSend,
  IconUserKey,
  IconX
} from "@tabler/icons-react";
import { useModal } from "@/hooks/use-modal-store";
import { cn } from "@/lib/utils";
import { useMessage } from "@/hooks/use-message";
import toast from "react-hot-toast";

import { useQueryClient } from "@tanstack/react-query";
import { PartialProfile } from "@/types/friend";
import { useReply } from "@/hooks/use-reply-store";
import { useSocket } from "@/hooks/use-socket-store";
import { useCallback, useEffect, useRef } from "react";
import { useUser } from "@/hooks/use-user-store";
import Image from "next/image";
import { useTyping } from "@/hooks/use-typing-store";
import { useDebounce } from "@/hooks/use-debounce";
import { CreateMessageType } from "@/validators/message";

type ChatInputProps = {
  conversationId?: string;
  serverId?: string;
  channelId?: string;
  participants?: PartialProfile[];

  name: string;
  type: "channel" | "member" | "group" | "friend";
};

export function ChatInput({
  conversationId,
  serverId,
  channelId,
  participants,
  name,
  type
}: ChatInputProps) {
  const queryClient = useQueryClient();

  const replyingTo = useReply(state => state.replyingTo);
  const clearReply = useReply(state => state.clearReply);
  const { user, file, setFile } = useUser();

  const { open, isOpen, type: modalType } = useModal();

  const { createMessage } = useMessage();

  const isSidebarProfileOpen = isOpen && modalType === "profile-sidebar";

  const form = useForm<ChatInputType>({
    resolver: zodResolver(ChatInputSchema),
    defaultValues: {
      content: ""
    }
  });

  const socket = useSocket(state => state.socket);

  useEffect(() => {
    if (!socket) return;

    socket?.emit("conversation:join", conversationId);

    return () => {
      socket?.emit("conversation:leave", conversationId);
    };
  }, [socket, conversationId]);

  useEffect(() => {
    if (!socket || !conversationId) return;

    const handleNewMessage = (message: CreateMessageType) => {
      queryClient.setQueryData(["messages", conversationId], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page: any, index: number) => {
            if (index !== 0) return page;

            return {
              ...page,
              data: {
                ...page.data,
                messages: [...page.data.messages, message]
              }
            };
          })
        };
      });
    };

    socket.on("message:new", handleNewMessage);

    return () => {
      socket.off("message:new", handleNewMessage);
    };
  }, [socket, conversationId, queryClient]);

  const isTypingRef = useRef(false);

  const emitTypingStop = useDebounce(() => {
    if (!socket || !conversationId || !user?.id) return;

    if (!isTypingRef.current) return;

    isTypingRef.current = false;

    socket.emit("typing:stop", {
      conversationId,
      userId: user.id,
      username: user.username
    });
  }, 1500);

  const emitTypingStart = useCallback(() => {
    if (!socket || !conversationId || !user?.id) return;

    if (isTypingRef.current) return;

    isTypingRef.current = true;

    socket.emit("typing:start", {
      conversationId,
      userId: user.id,
      username: user.username
    });
  }, [socket, conversationId, user]);

  useEffect(() => {
    if (!socket) return;

    const handleTypingStart = (payload: {
      conversationId: string;
      userId: string;
      username: string;
    }) => {
      if (payload.userId === user?.id) return;

      useTyping.getState().addTypingUser(payload.conversationId, {
        userId: payload.userId,
        username: payload.username,
        conversationId: payload.conversationId
      });
    };

    const handleTypingStop = (payload: {
      conversationId: string;
      userId: string;
    }) => {
      if (payload.userId === user?.id) return;

      useTyping
        .getState()
        .removeTypingUser(payload.conversationId, payload.userId);
    };

    socket.on("typing:start", handleTypingStart);
    socket.on("typing:stop", handleTypingStop);

    return () => {
      socket.off("typing:start", handleTypingStart);
      socket.off("typing:stop", handleTypingStop);
    };
  }, [socket, user?.id]);

  useEffect(() => {
    return () => {
      emitTypingStop.cancel?.();

      if (isTypingRef.current) {
        socket?.emit("typing:stop", {
          conversationId,
          userId: user?.id
        });
      }
    };
  }, [socket, conversationId, user, emitTypingStop]);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (payload: {
      conversationId: string;
      userId: string;
      content: string;
    }) => {
      // remove typing state immediately
      useTyping
        .getState()
        .removeTypingUser(payload.conversationId, payload.userId);

      // your existing message logic...
    };

    socket.on("message:send", handleMessage);

    return () => {
      socket.off("message:send", handleMessage);
    };
  }, [socket]);

  const onSubmit = async (data: ChatInputType) => {
    try {
      const res = await createMessage({
        content: data.content,
        conversationId,
        serverId,
        channelId,
        replyTo: replyingTo?._id,
        privateUsers: replyingTo?.visibleTo
      });

      if (!res.success) {
        toast.error(res.message || "Failed to send message");
        return;
      }

      console.log({ res });

      const message = res.data;

      socket?.emit("message:send", {
        conversationId,
        message
      });

      form.reset();
      clearReply();

      requestAnimationFrame(() => {
        const container = document.getElementById("messages-container");

        container?.scrollTo({
          top: container.scrollHeight,
          behavior: "smooth"
        });
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message");
    }
  };

  const content = useWatch({
    control: form.control,
    name: "content"
  });

  return (
    <div
      className={cn(
        "bg-background sticky bottom-0 px-3 py-2",
        isSidebarProfileOpen && "lg:pr-82"
      )}>
      <form
        onSubmit={e => {
          e.preventDefault();
          void form.handleSubmit(onSubmit)();
        }}>
        <FieldGroup>
          <Controller
            name="content"
            control={form.control}
            render={({ field }) => (
              <Field className="flex flex-col justify-end">
                <div className="relative">
                  {replyingTo && (
                    <div className="absolute bottom-full left-0 mb-2 w-full rounded-md border bg-neutral-200 px-3 py-2 text-sm dark:bg-neutral-900">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-muted-foreground text-sm">
                            Replying to{" "}
                            <span className="text-foreground">
                              @{replyingTo.sender.username}
                            </span>
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={clearReply}
                          className="text-muted-foreground bg-muted hover:text-foreground flex size-8 cursor-pointer items-center justify-center rounded-full p-1">
                          ✕
                        </button>
                      </div>
                    </div>
                  )}
                  {file?.url && (
                    <div className="relative flex items-center justify-center">
                      <Image
                        src={file.url}
                        alt={file.type || "File"}
                        width={100}
                        height={100}
                        className="size-20 rounded-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFile({ url: null, type: null })}
                        className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white">
                        <IconX className="size-4" />
                      </button>
                    </div>
                  )}
                  <InputGroup className="has-[[data-slot=input-group-control]:focus-visible]:border-input items-start in-data-[slot=combobox-content]:focus-within:border-transparent has-[[data-slot=input-group-control]:focus-visible]:ring-0 [[data-slot=input-group-control]:focus-visible]:border-none">
                    <InputGroupTextarea
                      {...field}
                      // ref={textareaRef}
                      id="chat-input"
                      className={cn(
                        "no-scrollbar resize-none",
                        "max-h-[120px] min-h-[63.5px]",
                        "leading-5"
                      )}
                      autoFocus={replyingTo?._id ? true : false}
                      placeholder={`Message  ${type === "channel" ? `#${name}` : type === "member" ? `@${name}` : `${name}`}`}
                      onKeyDown={e => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          form.handleSubmit(onSubmit)();
                        }
                      }}
                      onChange={e => {
                        field.onChange(e);

                        const value = e.target.value;

                        // input cleared
                        if (!value.trim()) {
                          emitTypingStop.cancel?.();

                          if (isTypingRef.current) {
                            isTypingRef.current = false;

                            socket?.emit("typing:stop", {
                              conversationId,
                              userId: user?.id,
                              username: user?.username
                            });
                          }

                          return;
                        }

                        emitTypingStart();
                        emitTypingStop();
                      }}
                    />
                    <InputGroupAddon>
                      <IconPlus
                        onClick={() => open("file-upload")}
                        className="text-muted-foreground hover:bg-secondary size-8 cursor-pointer rounded-lg p-2"
                      />
                    </InputGroupAddon>
                    <InputGroupAddon align="inline-end">
                      <Popover>
                        <PopoverTrigger
                          render={
                            <button
                              type="button"
                              onMouseDown={e => e.preventDefault()}>
                              <IconMoodSmile className="hover:text-accent-foreground cursor-pointer" />
                            </button>
                          }></PopoverTrigger>

                        <PopoverContent className="w-fit p-0">
                          <EmojiPicker
                            className="h-85.5"
                            onEmojiSelect={({ emoji }) => {
                              const input = document.getElementById(
                                "chat-input"
                              ) as HTMLTextAreaElement | null;
                              if (!input) {
                                return;
                              }
                              if (input) {
                                const start =
                                  input.selectionStart ?? field.value.length;
                                const end =
                                  input.selectionEnd ?? field.value.length;

                                const newValue =
                                  field.value.slice(0, start) +
                                  emoji +
                                  field.value.slice(end);

                                field.onChange(newValue);

                                requestAnimationFrame(() => {
                                  input.selectionStart = input.selectionEnd =
                                    start + emoji.length;
                                });
                              }
                            }}>
                            <EmojiPickerSearch />
                            <EmojiPickerContent />
                            <EmojiPickerFooter />
                          </EmojiPicker>
                        </PopoverContent>
                      </Popover>
                      <InputGroupButton
                        type="submit"
                        className={"group rounded-lg px-2 py-4.5"}>
                        <IconSend
                          title="Ctrl + Enter"
                          className="text-muted-foreground group-hover:bg-secondary group-hover:text-accent-foreground size-5 cursor-pointer rounded-lg"
                        />
                      </InputGroupButton>
                      {type === "group" && (
                        <InputGroupButton
                          type="button"
                          onClick={() => {
                            open("private-user", {
                              privateMessage: {
                                conversationId: conversationId as string,
                                participants: participants || [],
                                content
                              }
                            });
                            form.reset();
                            form.setFocus("content");
                          }}
                          className={"rounded-lg px-2 py-4.5"}>
                          <IconUserKey className="text-primary-500 size-5 cursor-pointer rounded-lg" />
                        </InputGroupButton>
                      )}
                    </InputGroupAddon>
                  </InputGroup>
                </div>
              </Field>
            )}
          />
        </FieldGroup>
      </form>
    </div>
  );
}

export function BlockedUserChatInput() {
  const { isOpen, type: modalType } = useModal();

  const isSidebarProfileOpen = isOpen && modalType === "profile-sidebar";
  return (
    <div
      className={cn(
        "bg-secondary/60 border-edge mx-4 mt-4.5 flex items-center justify-between rounded-lg border px-6 py-5",
        isSidebarProfileOpen && "lg:pr-82"
      )}>
      <p className="text-center font-medium">
        You cannot send messages to this user because you have blocked them or
        they have blocked you.
      </p>
    </div>
  );
}
