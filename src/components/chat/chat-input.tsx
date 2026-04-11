"use client";

import { ChatInputSchema, ChatInputType } from "@/validators/chat";

import { Field, FieldGroup } from "@/components/ui/field";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea
} from "@/components/ui/input-group";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { IconPlus, IconSend } from "@tabler/icons-react";
import { useModal } from "@/hooks/use-modal-store";

type ChatInputProps = {
  apiUrl: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: Record<string, any>;
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
    <div className="p-3">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <Controller
            name="content"
            control={form.control}
            render={({ field }) => (
              <Field>
                <InputGroup className="has-[[data-slot=input-group-control]:focus-visible]:border-input in-data-[slot=combobox-content]:focus-within:border-transparent has-[[data-slot=input-group-control]:focus-visible]:ring-0 [[data-slot=input-group-control]:focus-visible]:border-none">
                  <InputGroupTextarea
                    {...field}
                    disabled={isLoading}
                    className="no-scrollbar h-16 resize-none"
                    placeholder={`Message  ${type === "channel" ? `#${name}` : `@${name}`}`}
                  />
                  <InputGroupAddon>
                    <IconPlus
                      onClick={() => open("file-upload")}
                      className="text-muted-foreground hover:bg-secondary size-8 cursor-pointer rounded-lg p-2"
                    />
                  </InputGroupAddon>
                  <InputGroupAddon align="inline-end">
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
