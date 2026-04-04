"use client";

import { InviteModal } from "@/components/modals/invite-modal";
import { CreateServerModal } from "@/components/modals/create-server-modal";
import { EditServerModal } from "@/components/modals/edit-server-modal";
import { MemberModal } from "@/components/modals/member-modal";
import { CreateChannelModal } from "@/components/modals/create-channel-modal";
import { CreateCategoryModal } from "@/components/modals/create-category-modal";
import { LeaveServerModal } from "@/components/modals/leave-server-modal";
import { DeleteServerModal } from "@/components/modals/delete-server-modal";

export function ModalProvider() {
  return (
    <>
      <CreateServerModal />
      <EditServerModal />
      <LeaveServerModal />
      <DeleteServerModal />

      <InviteModal />

      <MemberModal />

      <CreateChannelModal />

      <CreateCategoryModal />
    </>
  );
}
