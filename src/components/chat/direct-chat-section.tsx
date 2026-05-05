"use client";

import { IconPlus } from "@tabler/icons-react";
import { ActionTooltip } from "@/components/common/action-tooltip";
import { useModal } from "@/hooks/use-modal-store";
import { PartialProfile } from "@/types/friend";
import { IFile, IMessage } from "@/interface";
import { ConversationTypes } from "@/models/conversation.model";
import { FriendChatItem, GroupChatItem } from "@/components/chat/chat-item";
import { useEffect, useMemo } from "react";
import { useSocket } from "@/hooks/use-socket-store";
import { useUser } from "@/hooks/use-user-store";

export type PopulatedConversation = {
  _id: string;

  participants: PartialProfile[];
  admin: string;
  type: ConversationTypes;

  name?: string;
  logo?: IFile;
  lastMessage?: Pick<IMessage, "content" | "type"> & {
    sender: string;
  };
};

export function DirectChatSection({
  friend,
  conversations,
  user
}: {
  friend: string;
  conversations: string;
  user: string;
}) {
  const friends = useMemo(
    () => JSON.parse(friend) as PartialProfile[],
    [friend]
  );

  const conversationsData = useMemo(
    () => JSON.parse(conversations) as PopulatedConversation[],
    [conversations]
  );

  const currentUser = useMemo(() => JSON.parse(user) as PartialProfile, [user]);

  const { user: profile } = useUser();

  const filteredConversations = useMemo(() => {
    return (
      conversationsData?.filter(c => {
        if (c.type === "direct") {
          return (
            c.participants?.length > 0 &&
            c.participants.some(p => p._id !== currentUser._id)
          );
        }

        if (c.type === "group") {
          return !!(c._id && (c.name || c.participants?.length > 0));
        }

        return false;
      }) ?? []
    );
  }, [conversationsData, currentUser._id]);

  const { open } = useModal();

  const connect = useSocket(state => state.connect);

  useEffect(() => {
    if (profile?.id) {
      connect(profile.id);
    }
  }, [profile?.id, connect]);

  return (
    <div className="py-3">
      <div className="border-edge border-b pb-3">
        <div className="flex items-center justify-between px-3">
          <h3 className="text-muted-foreground hover:text-accent-foreground text-sm">
            Direct Chats
          </h3>
          <ActionTooltip
            label="Create Chat"
            side="top"
            size="sm"
            align="center">
            <IconPlus
              onClick={() =>
                open("new-chat", {
                  friends,
                  user: {
                    ...currentUser
                  }
                })
              }
              className="text-muted-foreground hover:text-accent-foreground size-5 cursor-pointer p-0.5"
            />
          </ActionTooltip>
        </div>

        <div className="mt-3 space-y-1.5 px-3">
          {filteredConversations.length > 0 &&
            filteredConversations.map(c => {
              if (c.type === "direct") {
                return <FriendChatItem c={c} key={c._id} />;
              }
              return <GroupChatItem c={c} key={c._id} />;
            })}
        </div>
      </div>
    </div>
  );
}
