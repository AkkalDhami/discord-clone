"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { IconCrownFilled, IconX } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { useModal } from "@/hooks/use-modal-store";
import { useConversation } from "@/hooks/use-conversaton";
import { useUser } from "@/hooks/use-user-store";
import { PartialProfile } from "@/types/friend";
import { UserAvatar } from "@/components/common/user-avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

export function KickGroupMemberModal() {
  const router = useRouter();
  const { close, isOpen, type, data } = useModal();
  const { user } = useUser();
  const isModalOpen = isOpen && type === "kick-group-members";
  const { kickGroupMember, isKickingGroupMember } = useConversation();

  const conversation = data?.conversation as
    | {
        _id: string;
        participants?: PartialProfile[];
        admin?: string;
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
            Only the group admin can kick members from this group.
          </p>
        </DialogHeader>

        <ScrollArea className="h-60 px-5 pb-5">
          {conversation.participants?.length ? (
            conversation.participants.map(participant => {
              const isGroupAdmin = participant._id === conversation.admin;

              return (
                <div
                  key={participant._id}
                  className="bg-secondary mt-2 flex items-center justify-between gap-3 rounded-lg p-3">
                  <div className="flex items-center gap-2.5">
                    <UserAvatar
                      name={participant.name}
                      src={participant.avatar?.url}
                    />
                    <div>
                      <p className="text-sm">{participant.name}</p>
                      <p className="text-muted-foreground text-xs">
                        @{participant.username}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isGroupAdmin && (
                      <IconCrownFilled className="size-4 text-orange-500" />
                    )}

                    {!isGroupAdmin && (
                      <button
                        type="button"
                        disabled={
                          !isAdmin || isGroupAdmin || isKickingGroupMember
                        }
                        onClick={() => onKickMember(participant._id)}
                        className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-red-500/10 p-0 text-red-600 hover:bg-red-600/20">
                        <IconX className="size-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-muted-foreground">No participants found.</p>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
