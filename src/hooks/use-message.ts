/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useInfiniteQuery } from "@tanstack/react-query";
import { v4 as uuid } from "uuid";

import * as messageApi from "@/lib/api/message";
import { ApiResponse, FetchMessagesResponse } from "@/interface/response";
import { UpdateMessageType } from "@/validators/message";
import { useUser } from "./use-user-store";

export type FetchMessagePayload = {
  conversationId: string;
  limit: number;
  cursor?: string;
};

export function useMessage() {
  const { user } = useUser();

  const queryClient = useQueryClient();

  const createMessageMutation = useMutation({
    mutationFn: messageApi.createMessage,

    onMutate: async payload => {
      const { conversationId, content } = payload;

      // stop ongoing refetch
      await queryClient.cancelQueries({
        queryKey: ["messages", conversationId]
      });

      const previousData = queryClient.getQueryData([
        "messages",
        conversationId
      ]);

      // optimistic message object
      const optimisticMessage = {
        _id: uuid(), // temporary id
        conversation: conversationId,
        content,
        createdAt: new Date().toISOString(),
        edited: false,
        isBot: false,
        isAdmin: false,
        type: "TEXT",
        optimistic: true,
        sender: {
          ...user,
          _id: user?.id
        }
      };

      // update cache (insert into first page because your API returns newest first)
      queryClient.setQueryData(["messages", conversationId], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page: any, index: number) => {
            if (index !== 0) return page;

            return {
              ...page,
              data: {
                ...page.data,
                messages: [optimisticMessage, ...page.data.messages]
              }
            };
          })
        };
      });

      return { previousData, optimisticId: optimisticMessage._id };
    },

    onSuccess: (res, payload, context) => {
      const { conversationId } = payload;

      // replace optimistic message with real message
      queryClient.setQueryData(["messages", conversationId], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: {
              ...page.data,
              messages: page.data.messages.map((msg: any) =>
                msg._id === context?.optimisticId ? res.data.message : msg
              )
            }
          }))
        };
      });
    },

    onError: (_err, payload, context) => {
      const { conversationId } = payload;

      // rollback to previous state
      queryClient.setQueryData(
        ["messages", conversationId],
        context?.previousData
      );
    },

    onSettled: (_data, _err, payload) => {
      queryClient.invalidateQueries({
        queryKey: ["messages", payload.conversationId]
      });
    }
  });

  const updateMessageMutation = useMutation({
    mutationFn: async (data: UpdateMessageType & { messageId: string }) => {
      const res = await messageApi.updateMessage(data);
      return res as ApiResponse;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    }
  });

  const togglePinMessageMutation = useMutation({
    mutationFn: async ({
      messageId,
      pinned
    }: UpdateMessageType & { messageId: string }) => {
      const res = await messageApi.updateMessage({
        messageId,
        pinned
      });
      return res as ApiResponse;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    }
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const res = await messageApi.deleteMessage(messageId);
      return res as ApiResponse;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    }
  });

  return {
    createMessage: createMessageMutation.mutateAsync,
    isMessageCreating: createMessageMutation.isPending,

    updateMessage: updateMessageMutation.mutateAsync,
    isMessageUpdating: updateMessageMutation.isPending,

    togglePinMessage: togglePinMessageMutation.mutateAsync,
    isMessageTogglingPin: togglePinMessageMutation.isPending,

    deleteMessage: deleteMessageMutation.mutateAsync,
    isMessageDeleting: deleteMessageMutation.isPending
  };
}

export function useInfiniteMessages({
  conversationId,
  limit = 50,
  cursor: initialCursor
}: FetchMessagePayload) {
  const initialPageParam = initialCursor ?? null;

  return useInfiniteQuery<FetchMessagesResponse>({
    queryKey: ["messages", conversationId, initialPageParam],
    queryFn: async ({ pageParam }) => {
      const res = await messageApi.fetchMessages({
        conversationId,
        limit,
        cursor: pageParam != null ? String(pageParam) : undefined
      });

      return res as FetchMessagesResponse;
    },
    initialPageParam,
    getNextPageParam: lastPage => lastPage.data.nextCursor ?? undefined,
    enabled: !!conversationId
  });
}
