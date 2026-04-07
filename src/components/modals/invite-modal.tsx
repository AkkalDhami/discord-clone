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
import { Label } from "@/components/ui/label";
import { IconCheck, IconCopy, IconRefresh } from "@tabler/icons-react";
import { useOrigin } from "@/hooks/use-origin";
import { useState } from "react";
import toast from "react-hot-toast";
import { useServer } from "@/hooks/use-server";
import { cn } from "@/lib/utils";

export function InviteModal() {
  const { close, isOpen, type, data, open } = useModal();
  const isModalOpen = isOpen && type === "invite-people";
  const [copied, setCopied] = useState(false);
  const { generateInviteLink, generateInviteLinkLoading } = useServer();
  const origin = useOrigin();
  const { server } = data;
  if (!server) {
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
      open("invite-people", {
        server: {
          ...server,
          inviteCode: res?.data?.inviteCode
        }
      });
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
          <DialogTitle>Invite friends to {server.name}</DialogTitle>

          <div className="mt-2 space-y-2">
            <Label className="text-muted-foreground text-xs font-medium uppercase">
              Server invite link
            </Label>
            <div className="mt-2 flex items-center gap-x-2">
              <Input
                readOnly
                className={cn(
                  "focus-visible:border-border flex-1 border focus-visible:ring-0 focus-visible:ring-offset-0",
                  generateInviteLinkLoading && "cursor-not-allowed"
                )}
                disabled={generateInviteLinkLoading}
                value={inviteUrl}
              />
              {copied ? (
                <Button
                  type="button"
                  variant={"ghost"}
                  className="h-9 cursor-default bg-green-500 px-2 py-1.5 text-white hover:bg-green-600 hover:text-white dark:hover:bg-green-600">
                  <IconCheck className="size-5" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={onCopy}
                  disabled={generateInviteLinkLoading}
                  variant={"ghost"}
                  className="h-9 bg-indigo-500 px-2 py-1.5 text-white hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600">
                  <IconCopy className="size-5" />
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
              <IconRefresh
                className={cn(
                  "size-4",
                  generateInviteLinkLoading && "animate-spin"
                )}
              />
            </Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
