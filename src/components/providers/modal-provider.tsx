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

import { FileUploadModal } from "@/components/modals/file-upload-modal";

import { RemoveMemberModal } from "@/components/modals/remove-member-modal";
import { AddFriendModal } from "@/components/modals/add-friend-modal";
import { NewChatModal } from "@/components/modals/new-chat-modal";

import { RemoveFriendModal } from "@/components/modals/remove-friend-modal";
import { BlockFriendModal } from "@/components/modals/block-friend-modal";

import { ProfileSidebar } from "@/components/layouts/profile-sidebar";

import { EditGroupModal } from "@/components/modals/edit-group-modal";
import { AddGroupMembersModal } from "@/components/modals/add-group-members-modal";
import { KickGroupMemberModal } from "@/components/modals/kick-group-member-modal";
import { LeaveGroupModal } from "@/components/modals/leave-group-modal";
import { DeleteConversationModal } from "@/components/modals/delete-conversation-modal";

import { EditMessageModal } from "@/components/modals/edit-message-modal";
import { DeleteMessageModal } from "@/components/modals/delete-message-modal";
import { ForwardMessageModal } from "@/components/modals/forward-message-modal";

import { PrivateUserModal } from "@/components/modals/private-user-modal";

export function ModalProvider() {
  return (
    <>
      <CreateServerModal />
      <EditServerModal />
      <LeaveServerModal />
      <DeleteServerModal />

      <FileUploadModal />

      <ProfileSidebar />

      <InviteModal />
      <NewChatModal />
      <EditGroupModal />
      <KickGroupMemberModal />
      <DeleteConversationModal />

      <AddGroupMembersModal />
      <LeaveGroupModal />

      <AddFriendModal />
      <RemoveFriendModal />
      <BlockFriendModal />

      <MemberModal />
      <AddMemberModal />
      <RemoveMemberModal />

      <CreateChannelModal />
      <EditChannelModal />
      <DeleteChannelModal />

      <CreateCategoryModal />
      <EditCategoryModal />
      <DeleteCategoryModal />

      <EditMessageModal />
      <DeleteMessageModal />
      <ForwardMessageModal />

      <PrivateUserModal />
    </>
  );
}
