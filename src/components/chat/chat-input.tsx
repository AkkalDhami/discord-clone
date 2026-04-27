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
import { Controller, useForm } from "react-hook-form";
import { IconMoodSmile, IconPlus, IconSend } from "@tabler/icons-react";
import { useModal } from "@/hooks/use-modal-store";
import { cn } from "@/lib/utils";
import { useMessage } from "@/hooks/use-message";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

type ChatInputProps = {
  query: Record<string, unknown>;
  name: string;
  type: "channel" | "member" | "group" | "friend";
};
//conversationId

export function ChatInput({ query, name, type }: ChatInputProps) {
  const { open, isOpen, type: modalType } = useModal();
  const router = useRouter();

  const { createMessage, isMessageCreating } = useMessage();

  const isSidebarProfileOpen = isOpen && modalType === "profile-sidebar";

  const form = useForm<ChatInputType>({
    resolver: zodResolver(ChatInputSchema),
    defaultValues: {
      content: ""
    }
  });

  const onSubmit = async (data: ChatInputType) => {
    try {
      const res = await createMessage({
        content: data.content,
        conversationId: query.conversationId as string
      });
      console.log(res);

      if (res.success) {
        toast.success(res.message || "Message sent successfully");
        form.reset();
        return;
      } else {
        toast.error(res.message || "Failed to send message");
        return;
      }
    } catch (error) {
      console.error({ error });
      toast.error("Failed to send message");
    } finally {
      router.refresh();
    }
  };

  const isLoading = form.formState.isSubmitting || isMessageCreating;

  return (
    <div className={cn("px-3 py-2", isSidebarProfileOpen && "lg:pr-82")}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <Controller
            name="content"
            control={form.control}
            render={({ field }) => (
              <Field>
                <InputGroup className="has-[[data-slot=input-group-control]:focus-visible]:border-input items-start in-data-[slot=combobox-content]:focus-within:border-transparent has-[[data-slot=input-group-control]:focus-visible]:ring-0 [[data-slot=input-group-control]:focus-visible]:border-none">
                  <InputGroupTextarea
                    {...field}
                    disabled={isLoading}
                    id="chat-input"
                    className="no-scrollbar h-10 resize-none"
                    placeholder={`Message  ${type === "channel" ? `#${name}` : type === "member" ? `@${name}` : `${name}`}`}
                    onKeyUp={e => {
                      if (e.key === "Enter" && e.ctrlKey) {
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
                      disabled={isLoading}
                      className={"rounded-lg px-2 py-4.5"}>
                      <IconSend className="text-muted-foreground hover:bg-secondary size-5 cursor-pointer rounded-lg" />
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
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
