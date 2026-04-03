"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useModal } from "@/hooks/use-modal-store";
import { Label } from "../ui/label";
import { IconCheck, IconCopy, IconRefresh } from "@tabler/icons-react";
import { useOrigin } from "@/hooks/use-origin";
import { useState } from "react";
import toast from "react-hot-toast";
import { useServer } from "@/hooks/use-server";

export function InviteModal() {
  const { close, isOpen, type, data, open } = useModal();
  const isModalOpen = isOpen && type === "invite-people";
  const [copied, setCopied] = useState(false);
  const { generateInviteLink, generateInviteLinkLoading } = useServer();
  const origin = useOrigin();
  const { server } = data;
  if (!server) {
    // close();

    return;
  }
  const inviteUrl = `${origin}/invite/${server?.inviteCode}`;
  const onCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  const onNewLink = async () => {
    try {
      const res = await generateInviteLink(server?._id?.toString());
      console.log({ res });
      toast.success("New link generated successfully");
      open("invite-people", { server });
    } catch (error) {
      console.log({ error });
      toast.error("Failed to generate new link");
    }
  };
  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={open => {
        if (!open) close();
      }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite to server</DialogTitle>
          <p className="text-muted-foreground">
            Invite your friends to this server
          </p>

          <div className="mt-2 space-y-2">
            <Label className="text-muted-foreground text-xs font-medium uppercase">
              Server invite link
            </Label>
            <div className="mt-2 flex items-center gap-x-2">
              <Input
                className="flex-1 border focus-visible:ring-offset-0"
                value={inviteUrl}
              />
              {copied ? (
                <Button
                  type="button"
                  variant={"ghost"}
                  className="h-9 cursor-default py-1.5 text-green-500 hover:text-green-500">
                  <IconCheck className="size-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={onCopy}
                  variant={"ghost"}
                  className="h-9 py-1.5">
                  <IconCopy className="size-4" />
                </Button>
              )}
            </div>
            <Button
              type="button"
              variant={"link"}
              className={"px-0 font-normal"}
              onClick={onNewLink}
              disabled={generateInviteLinkLoading}>
              {generateInviteLinkLoading
                ? "Generating..."
                : "Generate a new link"}
              <IconRefresh className="size-4" />
            </Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
