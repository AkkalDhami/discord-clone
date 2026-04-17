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
  InputGroupInput
} from "@/components/ui/input-group";

import { IconMoodSmile } from "@tabler/icons-react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  EmojiPicker,
  EmojiPickerSearch,
  EmojiPickerContent,
  EmojiPickerFooter
} from "@/components/ui/emoji-picker";

type EmojiInputProps<T extends FieldValues> = React.ComponentProps<
  typeof InputGroupInput
> & {
  control: Control<T>;
  name: Path<T>;
  label: string;
  type?: "input" | "textarea";
};

export function EmojiInput<T extends FieldValues>({
  control,
  name,
  label,
  ...inputProps
}: EmojiInputProps<T>) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        return (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              htmlFor={id}
              className="text-muted-primary font-medium uppercase">
              {label}
            </FieldLabel>
            <InputGroup>
              <InputGroupInput
                id={id}
                {...field}
                {...inputProps}
                aria-invalid={fieldState.invalid}
              />

              <InputGroupAddon align="inline-end">
                <Popover open={open} onOpenChange={setOpen}>
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
                          id
                        ) as HTMLInputElement;

                        if (input) {
                          const start =
                            input.selectionStart ?? field.value.length;
                          const end = input.selectionEnd ?? field.value.length;

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
              </InputGroupAddon>
            </InputGroup>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        );
      }}
    />
  );
}
