"use client";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Spinner } from "@/components/ui/spinner";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useModal } from "@/hooks/use-modal-store";
import {
  CreateChannelSchema,
  CreateChannelSchemaType
} from "@/validators/channel";
import ChannelType from "@/enums/channel.enum";
import { IconHash, IconVideo, IconVolume } from "@tabler/icons-react";
import { useChannel } from "@/hooks/use-channel";
import { EmojiClickData } from "emoji-picker-react";
import { EmojiInput } from "@/components/common/emoji-input";

export function CreateChannelModal() {
  const { close, isOpen, type, data } = useModal();
  const isModalOpen = isOpen && type === "create-channel";

  const { server, category } = data;

  const { createChannel, isChannelCreating } = useChannel();
  const router = useRouter();

  const form = useForm<CreateChannelSchemaType>({
    resolver: zodResolver(CreateChannelSchema),
    defaultValues: {
      name: "",
      type: ChannelType.TEXT
    }
  });

  const name = useWatch({
    control: form.control,
    name: "name"
  });

  const onEmojiClick = (emojiData: EmojiClickData) => {
    form.setValue("name", (name || "") + emojiData.emoji, {
      shouldDirty: true
    });
  };

  async function onSubmit(data: CreateChannelSchemaType) {
    try {
      const res = await createChannel({
        serverId: server?._id || "",
        data,
        categoryId: category?._id || ""
      });
      if (res.success) {
        toast.success(res.message || "Channel created successfully");
        form.reset();
        router.refresh();
        close();
      } else {
        toast.error(res.message || "Failed to create channel");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to create channel");
    }
  }

  const isLoading = form.formState.isSubmitting || isChannelCreating;

  const handleClose = () => {
    form.reset();
    close();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Channel</DialogTitle>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-3"
            id="create-channel-form">
            <FieldGroup>
              <Controller
                name="type"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel
                      htmlFor="channel-type"
                      className="text-muted-primary font-medium uppercase">
                      Channel type
                    </FieldLabel>
                    <RadioGroup
                      {...field}
                      id="channel-type"
                      datatype={ChannelType.TEXT}
                      aria-invalid={fieldState.invalid}
                      className="mt-1 space-y-2">
                      <div className="flex gap-3">
                        <RadioGroupItem
                          value={ChannelType.TEXT}
                          id="text-channel"
                          className={"size-6"}
                        />
                        <Label
                          htmlFor="text-channel"
                          className="flex cursor-pointer flex-col items-start gap-1">
                          <div className="flex items-center gap-1">
                            <IconHash className="size-5" />
                            <span className="text-base font-medium">Text</span>
                          </div>
                          <span className="text-muted-primary text-sm">
                            Send messages, images, GIFs, emoji, opinions and
                            puns
                          </span>
                        </Label>
                      </div>
                      <div className="flex gap-3">
                        <RadioGroupItem
                          value={ChannelType.AUDIO}
                          id="audio-channel"
                          className={"size-6"}
                        />
                        <Label
                          htmlFor="audio-channel"
                          className="flex cursor-pointer flex-col items-start gap-1">
                          <div className="flex items-center gap-1">
                            <IconVolume className="size-5" />
                            <span className="text-base font-medium">Audio</span>
                          </div>
                          <span className="text-muted-primary text-sm">
                            Speak, listen, and hang out
                          </span>
                        </Label>
                      </div>
                      <div className="flex gap-3">
                        <RadioGroupItem
                          value={ChannelType.VIDEO}
                          id="video-channel"
                          className={"size-6"}
                        />
                        <Label
                          htmlFor="video-channel"
                          className="flex cursor-pointer flex-col items-start gap-1">
                          <div className="flex items-center gap-1">
                            <IconVideo className="size-5" />
                            <span className="text-base font-medium">Video</span>
                          </div>
                          <span className="text-muted-primary text-sm">
                            Hang out together with voice, video and screen share
                          </span>
                        </Label>
                      </div>
                    </RadioGroup>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <EmojiInput
                label="Channel name"
                control={form.control}
                name="name"
                placeholder="Enter channel name"
                onClick={emojiData => {
                  if ("emoji" in emojiData) {
                    onEmojiClick(emojiData);
                  }
                }}
              />
            </FieldGroup>
          </form>

          <div className="mt-2 grid sm:grid-cols-2 gap-2">
            <Button
              type="button"
              onClick={() => {
                close();
                form.reset();
              }}
              variant={"outline"}
              className={"h-10 w-full py-2 text-base font-medium"}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="create-channel-form"
              variant={"primary"}
              className="py-2 h-10 w-full"
              disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner /> Creating...
                </>
              ) : (
                "Create Channel"
              )}
            </Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
