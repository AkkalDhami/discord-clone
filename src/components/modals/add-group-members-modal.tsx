"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError
} from "@/components/ui/field";
import { useModal } from "@/hooks/use-modal-store";
import { useConversation } from "@/hooks/use-conversaton";
import { fetchWithAuth } from "@/lib/api/auth";
import {
  ConversationAddMembersSchema,
  type ConversationAddMembersType
} from "@/validators/conversation";
import { PartialProfile } from "@/types/friend";
import { IconCheck } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/common/user-avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";

export function AddGroupMembersModal() {
  const { isOpen, type, close, data } = useModal();
  const isModalOpen = isOpen && type === "add-group-members";
  const conversation = data?.conversation as
    | {
        _id: string;
        name?: string;
        participants?: PartialProfile[];
      }
    | undefined;

  const [query, setQuery] = useState("");

  const router = useRouter();

  const form = useForm<ConversationAddMembersType>({
    resolver: zodResolver(ConversationAddMembersSchema),
    defaultValues: {
      conversationId: conversation?._id ?? "",
      participants: []
    }
  });

  const { addGroupMembers, isAddingGroupMembers } = useConversation();

  const friendsQuery = useQuery({
    queryKey: ["friends", "group"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/friends", {
        method: "GET",
        credentials: "include"
      });
      return res.json();
    },
    staleTime: 1000 * 60 * 2
  });

  const existingMemberIds = useMemo(
    () => conversation?.participants?.map(member => member._id) ?? [],
    [conversation?.participants]
  );

  const friendProfiles = useMemo<PartialProfile[]>(() => {
    return (
      (friendsQuery.data?.data ?? [])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((record: any) => record.friend)
        .filter(Boolean)
    );
  }, [friendsQuery.data]);

  const availableFriends = useMemo(
    () =>
      friendProfiles.filter(friend => !existingMemberIds.includes(friend._id)),
    [friendProfiles, existingMemberIds]
  );

  const filteredFriends = useMemo(
    () =>
      availableFriends.filter(
        friend =>
          friend.name.toLowerCase().includes(query.toLowerCase()) ||
          friend.username.toLowerCase().includes(query.toLowerCase())
      ),
    [availableFriends, query]
  );

  useEffect(() => {
    if (isModalOpen && conversation) {
      form.reset({
        conversationId: conversation._id,
        participants: []
      });
    }
  }, [conversation, form, isModalOpen]);

  const participants = useWatch({
    control: form.control,
    name: "participants"
  });

  const toggleParticipant = (profileId: string) => {
    const current = form.getValues("participants") ?? [];
    if (current.includes(profileId)) {
      form.setValue(
        "participants",
        current.filter(id => id !== profileId)
      );
      return;
    }

    form.setValue("participants", [...current, profileId]);
  };

  const handleClose = () => {
    setQuery("");
    close();
  };

  const onSubmit = async (values: ConversationAddMembersType) => {
    if (!conversation?._id) {
      return toast.error("Unable to add members");
    }

    try {
      const response = await addGroupMembers(values);

      if (response.success) {
        toast.success(response.message || "Members added successfully");
        close();
        router.refresh();
        return;
      }

      toast.error(response.message || "Failed to add members");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add members");
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={open => !open && handleClose()}>
      <DialogContent className="text-accent-foreground w-full max-w-2xl gap-0 p-0">
        <DialogHeader className="px-5 py-4">
          <DialogTitle className="text-base font-medium">
            Add Friends to group
          </DialogTitle>
          <p className="text-muted-foreground text-sm">
            Pick friends to add to {conversation?.name ?? "this group"}.
          </p>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 px-5 pb-5">
          <FieldGroup>
            <Field>
              <FieldLabel>Search friends</FieldLabel>
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search friends by name or username"
              />
            </Field>

            <Field>
              <FieldLabel>Select members</FieldLabel>
              <ScrollArea className="h-50 space-y-2">
                {friendsQuery.isLoading ? (
                  <div className="border-border text-muted-foreground rounded-md border p-4 text-sm">
                    Loading friends...
                  </div>
                ) : filteredFriends.length === 0 ? (
                  <div className="border-border text-muted-foreground rounded-md border p-4 text-sm">
                    {availableFriends.length === 0
                      ? "No friends available to add."
                      : "No matching friends found."}
                  </div>
                ) : (
                  filteredFriends.map(friend => {
                    const isSelected = participants?.includes(friend._id);
                    return (
                      <button
                        key={friend._id}
                        type="button"
                        onClick={() => toggleParticipant(friend._id)}
                        className={`mt-2 flex w-full cursor-pointer items-center justify-between rounded-md px-3 py-2 text-left transition ${
                          isSelected ? "bg-secondary" : "hover:bg-secondary/60"
                        }`}>
                        <div className="flex items-center gap-2.5">
                          <UserAvatar
                            name={friend.name}
                            src={friend.avatar?.url}
                          />
                          <div>
                            <p className="text-sm">{friend.name}</p>
                            <p className="text-muted-foreground text-xs">
                              @{friend.username}
                            </p>
                          </div>
                        </div>

                        <div
                          className={cn(
                            "flex size-4 items-center justify-center rounded border transition-colors",
                            isSelected
                              ? "bg-primary-500 border-transparent"
                              : "border-border bg-transparent"
                          )}>
                          {isSelected && (
                            <IconCheck
                              className="size-2.5 text-white"
                              strokeWidth={3}
                            />
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </ScrollArea>
              {form.formState.errors.participants && (
                <FieldError errors={[form.formState.errors.participants]} />
              )}
            </Field>
          </FieldGroup>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isAddingGroupMembers || filteredFriends.length === 0}>
              {isAddingGroupMembers ? (
                <>
                  <Spinner /> Adding...
                </>
              ) : (
                "Add"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
