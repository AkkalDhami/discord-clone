"use client";

import { useId, useState } from "react";
import { Controller, Control, FieldValues, Path } from "react-hook-form";

import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupTextarea
} from "@/components/ui/input-group";

import { IconMoodSmile } from "@tabler/icons-react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  EmojiPicker,
  EmojiPickerSearch,
  EmojiPickerContent,
  EmojiPickerFooter
} from "@/components/ui/emoji-picker";

type EmojiInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  type?: "input" | "textarea";
} & React.ComponentProps<"input"> &
  React.ComponentProps<"textarea">;

export function EmojiInput<T extends FieldValues>({
  control,
  name,
  label,
  type = "input",
  ...inputProps
}: EmojiInputProps<T>) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const handleEmojiInsert = (emoji: string) => {
          const el = document.getElementById(id) as
            | HTMLInputElement
            | HTMLTextAreaElement
            | null;

          if (!el) return;

          const value = field.value || "";
          const start = el.selectionStart ?? value.length;
          const end = el.selectionEnd ?? value.length;

          const newValue = value.slice(0, start) + emoji + value.slice(end);

          field.onChange(newValue);

          requestAnimationFrame(() => {
            el.selectionStart = el.selectionEnd = start + emoji.length;
          });
        };

        return (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              htmlFor={id}
              className="text-muted-primary font-medium uppercase">
              {label}
            </FieldLabel>

            <InputGroup>
              {type === "textarea" ? (
                <InputGroupTextarea
                  id={id}
                  {...field}
                  {...inputProps}
                  aria-invalid={fieldState.invalid}
                />
              ) : (
                <InputGroupInput
                  id={id}
                  {...field}
                  {...inputProps}
                  aria-invalid={fieldState.invalid}
                />
              )}

              <InputGroupAddon align="inline-end">
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger
                    render={
                      <button
                        type="button"
                        onMouseDown={e => e.preventDefault()}>
                        <IconMoodSmile className="hover:text-accent-foreground cursor-pointer" />
                      </button>
                    }
                  />

                  <PopoverContent className="w-fit p-0">
                    <EmojiPicker
                      className="h-85.5"
                      onEmojiSelect={({ emoji }) => handleEmojiInsert(emoji)}>
                      <EmojiPickerSearch />
                      <EmojiPickerContent />
                      <EmojiPickerFooter />
                    </EmojiPicker>
                  </PopoverContent>
                </Popover>
              </InputGroupAddon>
            </InputGroup>

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        );
      }}
    />
  );
}
