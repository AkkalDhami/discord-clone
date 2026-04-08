/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useId, useState } from "react";
import { Controller, Control, FieldValues, Path } from "react-hook-form";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

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

type EmojiInputProps<T extends FieldValues> = React.ComponentProps<
  typeof InputGroupInput
> & {
  control: Control<T>;
  name: Path<T>;
  label: string;
  onClick: (emoji: EmojiClickData) => void;
};

export function EmojiInput<T extends FieldValues>({
  control,
  name,
  label,
  onClick,
  ...inputProps
}: EmojiInputProps<T>) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <Controller
      control={control as any}
      name={name as keyof T & string}
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
                        <IconMoodSmile className="cursor-pointer" />
                      </button>
                    }></PopoverTrigger>

                  <PopoverContent className="w-auto p-0">
                    <EmojiPicker onEmojiClick={onClick} />
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
