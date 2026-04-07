"use client";

import { InviteModal } from "@/components/modals/invite-modal";

import { CreateServerModal } from "@/components/modals/create-server-modal";
import { EditServerModal } from "@/components/modals/edit-server-modal";
import { DeleteServerModal } from "@/components/modals/delete-server-modal";
import { LeaveServerModal } from "@/components/modals/leave-server-modal";

import { MemberModal } from "@/components/modals/member-modal";
import { AddMemberModal } from "@/components/modals/add-member-modal";

import { CreateChannelModal } from "@/components/modals/create-channel-modal";
import { EditChannelModal } from "@/components/modals/edit-channel-modal";
import { DeleteChannelModal } from "@/components/modals/delete-channel-modal";

import { CreateCategoryModal } from "@/components/modals/create-category-modal";
import { EditCategoryModal } from "@/components/modals/edit-category-modal";
import { DeleteCategoryModal } from "@/components/modals/delete-category-modal";
import { RemoveMemberModal } from "@/components/modals/remove-member-modal";

export function ModalProvider() {
  return (
    <>
      <CreateServerModal />
      <EditServerModal />
      <LeaveServerModal />
      <DeleteServerModal />

      <InviteModal />

      <MemberModal />
      <AddMemberModal />
      <RemoveMemberModal />

      <CreateChannelModal />
      <EditChannelModal />
      <DeleteChannelModal />

      <CreateCategoryModal />
      <EditCategoryModal />
      <DeleteCategoryModal />
    </>
  );
}
