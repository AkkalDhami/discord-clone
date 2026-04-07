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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Spinner } from "@/components/ui/spinner";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useModal } from "@/hooks/use-modal-store";
import { EditChannelSchema, EditChannelSchemaType } from "@/validators/channel";
import ChannelType from "@/enums/channel.enum";
import { IconHash, IconVideo, IconVolume } from "@tabler/icons-react";
import { useChannel } from "@/hooks/use-channel";
import { useEffect } from "react";

export function EditChannelModal() {
  const { close, isOpen, type, data } = useModal();
  const isModalOpen = isOpen && type === "edit-channel";

  const channel = data.channel;

  const { editChannel, isChannelEditing } = useChannel();
  const router = useRouter();

  const form = useForm<EditChannelSchemaType>({
    resolver: zodResolver(EditChannelSchema),
    defaultValues: {
      name: "",
      type: ChannelType.TEXT
    }
  });

  useEffect(() => {
    if (channel) {
      form.setValue("name", channel.name);
      form.setValue("type", channel.type);
    }
  }, [channel, form]);

  async function onSubmit(data: EditChannelSchemaType) {
    try {
      const res = await editChannel({
        channelId: (channel?._id || "") as string,
        data
      });
      if (res.success) {
        toast.success(res.message);
        form.reset();
        router.refresh();
        close();
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to edit channel");
    }
  }

  const isLoading = form.formState.isSubmitting || isChannelEditing;

  const handleClose = () => {
    form.reset();
    close();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Channel</DialogTitle>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-3"
            id="edit-channel-form">
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

              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel
                      htmlFor="channel-name"
                      className="text-muted-primary font-medium uppercase">
                      Channel name
                    </FieldLabel>
                    <Input
                      {...field}
                      id="channel-name"
                      aria-invalid={fieldState.invalid}
                      placeholder="Enter channel name"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>

          <div className="grid mt-2 grid-cols-2 gap-2">
            <Button
              type="button"
              onClick={close}
              variant={"outline"}
              className={"h-10 py-2 text-base font-medium"}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="edit-channel-form"
              variant={"primary"}
              className="h-10 py-2 w-full"
              disabled={isLoading || !form.formState.isDirty}>
              {isLoading ? (
                <>
                  <Spinner /> Updating...
                </>
              ) : (
                "Update Channel"
              )}
            </Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
