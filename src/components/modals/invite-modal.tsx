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
import toast from "react-hot-toast";
import { useServer } from "@/hooks/use-server";
import { cn } from "@/lib/utils";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard.ts";

export function InviteModal() {
  const { close, isOpen, type, data, open } = useModal();
  const isModalOpen = isOpen && type === "invite-people";

  const { copied, copy } = useCopyToClipboard();

  const { generateInviteLink, generateInviteLinkLoading } = useServer();
  const origin = useOrigin();
  const { server } = data;
  if (!server) {
    return;
  }

  const inviteUrl = `${origin}/invite/${server?.inviteCode}`;
  const onCopy = () => {
    copy(inviteUrl);
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
              <div
                className={cn(
                  "border-input bg-background text-foreground w-full flex-1 overflow-hidden rounded-lg border px-2 py-1.5 text-sm break-all",
                  generateInviteLinkLoading &&
                    "bg-muted animate-pulse cursor-not-allowed"
                )}>
                <p className="m-0">{inviteUrl}</p>
              </div>
              {copied ? (
                <Button
                  type="button"
                  variant={"ghost"}
                  className="h-9 cursor-default px-2 py-1.5 text-green-600 hover:text-green-500 dark:hover:text-green-500">
                  <IconCheck className="size-5" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={onCopy}
                  disabled={generateInviteLinkLoading}
                  variant={"ghost"}
                  className="text-primary-500 hover:text-primary-600 h-9 px-2 py-1.5">
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
