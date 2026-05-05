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
  IconUserKey
} from "@tabler/icons-react";
import { useModal } from "@/hooks/use-modal-store";
import { cn } from "@/lib/utils";
import { useMessage } from "@/hooks/use-message";
import toast from "react-hot-toast";

import { useQueryClient } from "@tanstack/react-query";
import { PartialProfile } from "@/types/friend";
import { useReply } from "@/hooks/use-reply-store";
// import { useSocket } from "@/hooks/use-socket-store";

type ChatInputProps = {
  query: Record<string, unknown>;
  name: string;
  type: "channel" | "member" | "group" | "friend";
};

export function ChatInput({ query, name, type }: ChatInputProps) {
  const queryClient = useQueryClient();

  const replyingTo = useReply(state => state.replyingTo);
  const clearReply = useReply(state => state.clearReply);

  // const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { open, isOpen, type: modalType } = useModal();

  const { createMessage } = useMessage();

  const isSidebarProfileOpen = isOpen && modalType === "profile-sidebar";

  const form = useForm<ChatInputType>({
    resolver: zodResolver(ChatInputSchema),
    defaultValues: {
      content: ""
    }
  });

  // const socket = useSocket(state => state.socket);

  const onSubmit = async (data: ChatInputType) => {
    try {
      const res = await createMessage({
        content: data.content,
        conversationId: query.conversationId as string,
        serverId: query.serverId as string,
        channelId: query.channelId as string,
        replyTo: replyingTo?._id
      });

      if (!res.success) {
        toast.error(res.message || "Failed to send message");
        return;
      }

      form.reset();
      clearReply();

      requestAnimationFrame(() => {
        const container = document.getElementById("messages-container");
        container?.scrollIntoView({
          behavior: "smooth"
        });
      });

      await queryClient.invalidateQueries({
        queryKey: ["messages", query.conversationId]
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

  // useAutoResize(textareaRef, content);

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
                      // onKeyUp={e => {
                      //   if (e.key === "Enter" && e.ctrlKey) {
                      //     e.preventDefault();
                      //     form.handleSubmit(onSubmit)();
                      //   }
                      // }}
                      onKeyDown={e => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          form.handleSubmit(onSubmit)();
                        }
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
                                conversationId: query.conversationId as string,
                                participants:
                                  query.participants as PartialProfile[],
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
