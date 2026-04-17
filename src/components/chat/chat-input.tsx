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

type ChatInputProps = {
  apiUrl: string;
  query: Record<string, unknown>;
  name: string;
  type: "channel" | "member";
};

export function ChatInput({ apiUrl, query, name, type }: ChatInputProps) {
  const { open } = useModal();

  const form = useForm<ChatInputType>({
    resolver: zodResolver(ChatInputSchema),
    defaultValues: {
      content: ""
    }
  });

  const onSubmit = (data: ChatInputType) => {
    console.log(data);

    form.reset();
  };

  const isLoading = form.formState.isSubmitting;

  return (
    <div className="px-3 py-2">
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
                    placeholder={`Message  ${type === "channel" ? `#${name}` : `@${name}`}`}
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
