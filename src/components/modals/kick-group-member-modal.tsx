"use client";


import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { IconX } from "@tabler/icons-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useModal } from "@/hooks/use-modal-store";
import { useConversation } from "@/hooks/use-conversaton";
import { useUser } from "@/hooks/use-user-store";
import { PartialProfile } from "@/types/friend";

export function KickGroupMemberModal() {
  const router = useRouter();
  const { close, isOpen, type, data } = useModal();
  const { user } = useUser();
  const isModalOpen = isOpen && type === "kick-group-members";
  const { kickGroupMember, isKickingGroupMember } = useConversation();

  const conversation = data?.conversation as
    | {
        _id: string;
        name?: string;
        logo?: { url?: string } | undefined;
        participants?: PartialProfile[];
        admin?: string;
        type?: string;
      }
    | undefined;

  const isAdmin = user?.id && conversation?.admin === user.id;

  const handleClose = () => {
    close();
  };

  async function onKickMember(participantId: string) {
    if (!conversation?._id) {
      return toast.error("Unable to kick member");
    }

    try {
      const response = await kickGroupMember({
        conversationId: conversation._id,
        participants: [participantId]
      });

      if (response.success) {
        toast.success(response.message || "Member kicked successfully");
        router.refresh();
        close();
        return;
      }

      toast.error(response.message || "Failed to kick member");
    } catch (error) {
      console.error(error);
      toast.error("Failed to kick member");
    }
  }

  if (!conversation) {
    return null;
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={open => !open && handleClose()}>
      <DialogContent className="text-accent-foreground w-full max-w-lg gap-0 p-0">
        <DialogHeader className="px-5 py-4">
          <DialogTitle className="text-base font-medium">
            Manage group members
          </DialogTitle>
          <p className="text-muted-foreground text-sm">
            Only the group admin can remove members from this group.
          </p>
        </DialogHeader>

        <div className="space-y-3 px-5 pb-5">
          {conversation.participants?.length ? (
            conversation.participants.map(participant => {
              const isGroupAdmin = participant._id === conversation.admin;

              return (
                <div
                  key={participant._id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted p-3">
                  <div>
                    <p className="font-medium">{participant.name}</p>
                    <p className="text-sm text-muted-foreground">
                      @{participant.username}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isGroupAdmin && (
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                        Admin
                      </span>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={!isAdmin || isGroupAdmin || isKickingGroupMember}
                      onClick={() => onKickMember(participant._id)}
                      className="h-9 w-9 rounded-full p-0 text-destructive">
                      <IconX className="size-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-muted-foreground">No participants found.</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Close
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isKickingGroupMember}>
              {isKickingGroupMember ? (
                <>
                  <Spinner /> Working...
                </>
              ) : (
                "Done"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
