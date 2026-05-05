"use client";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty";
import { IconServer2 } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";

export function ServerEmpty() {
  const { open } = useModal();
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconServer2 />
        </EmptyMedia>
        <EmptyTitle>No servers yet</EmptyTitle>
        <EmptyDescription>
          Start creating servers to connect with friends.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="primary" onClick={() => open("create-server")}>
          Add a Server
        </Button>
      </EmptyContent>
    </Empty>
  );
}
