"use client";

import { ServerModal } from "@/components/modals/server-modal";
import { InviteModal } from "@/components/modals/invite-modal";

export function ModalProvider() {
  return (
    <>
        <ServerModal />
        <InviteModal />
    </>
  );
}
