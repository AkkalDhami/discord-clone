"use client";

import React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

import { ScrollArea } from "@/components/ui/scroll-area";

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor
} from "@/components/ui/combobox";

import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/common/user-avatar";

import { useModal } from "@/hooks/use-modal-store";
import { useCategory } from "@/hooks/use-category";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Spinner } from "@/components/ui/spinner";
import { RoleIconMap } from "@/components/modals/member-modal";
import MemberRole from "@/enums/role.enum";

export function AddMemberModal() {
  const { close, isOpen, type, data, open } = useModal();
  const router = useRouter();
  const anchor = useComboboxAnchor();

  const isModalOpen = isOpen && type === "add-members";

  const { updateMember, isMemberUpdating } = useCategory();

  const { server, category } = data;

  const [selectedMembers, setSelectedMembers] = React.useState<string[]>([]);

  if (!server) return null;

  const items = server.members
    .filter(member => member.profileId !== server.profileId)
    .map(member => ({
      label: member.profile.name,
      value: member._id
    }));

  async function handleCreate() {
    if (items.length === 0) {
      // close();
      open("create-category", {
        server
      });
      return;
    }

    try {
      const res = await updateMember({
        categoryId: category?._id || "",
        serverId: server?._id || "",
        type: "add",
        memberIds: selectedMembers
      });

      if (res.success) {
        toast.success(res.message || "Members added");
        close();
        router.refresh();
        setSelectedMembers([]);
      } else {
        toast.error(res.message || "Failed to add members");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  }

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={openState => {
        if (!openState) close();
      }}>
      <DialogContent className="w-full max-w-200">
        <DialogHeader>
          <DialogTitle>Add Members</DialogTitle>
          <DialogDescription className="text-base font-medium">
            {server.members.length} Member
            {server.members.length > 1 ? "s" : ""}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className={"mt-4 h-50 w-full pr-6"}>
          {server.members.map(member => (
            <div
              key={member._id}
              className={"mt-3 flex items-center justify-between first:mt-0"}>
              <div className="flex items-center gap-2">
                <UserAvatar
                  src={member.profile.avatar?.url}
                  name={member.profile.name}
                />
                <div>
                  <p className="flex items-center gap-2 text-sm font-medium">
                    {member.profile.name}
                    {member.role && RoleIconMap[member.role as MemberRole]}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {member.profile.email}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>

        <Combobox
          multiple
          autoHighlight
          items={items}
          value={selectedMembers}
          onValueChange={setSelectedMembers}>
          <ComboboxChips ref={anchor} className="w-full">
            <ComboboxValue>
              {values => (
                <>
                  {values.map((value: string) => {
                    const member = server.members.find(m => m._id === value);

                    return (
                      <ComboboxChip key={value}>
                        {member?.profile.name}
                      </ComboboxChip>
                    );
                  })}
                  <ComboboxChipsInput placeholder="Select members..." />
                </>
              )}
            </ComboboxValue>
          </ComboboxChips>

          <ComboboxContent anchor={anchor} className={"bg-secondary"}>
            <ComboboxEmpty>No members found.</ComboboxEmpty>
            <ComboboxList>
              {item => {
                const member = server.members.find(m => m._id === item.value);

                return (
                  <ComboboxItem key={item.value} value={item.value}>
                    <div className="flex items-center gap-2">
                      <UserAvatar
                        src={member?.profile.avatar?.url}
                        name={member?.profile.name}
                        className="size-7"
                      />
                      <p className="text-sm font-medium">
                        {member?.profile.name}
                      </p>
                    </div>
                  </ComboboxItem>
                );
              }}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-10 text-base font-medium"
            onClick={() => {
              close();
              open("create-category", {
                server
              });
            }}>
            Back
          </Button>

          <Button
            onClick={handleCreate}
            variant="primary"
            className="h-10 w-full"
            disabled={isMemberUpdating}>
            {isMemberUpdating ? (
              <>
                <Spinner /> Updating...
              </>
            ) : (
              "Add Members"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
