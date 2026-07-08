/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useInfiniteQuery } from "@tanstack/react-query";
import { v4 as uuid } from "uuid";

import * as messageApi from "@/lib/api/message";
import { ApiResponse, FetchMessagesResponse } from "@/interface/response";
import { UpdateMessageType } from "@/validators/message";
import { useUser } from "./use-user-store";

export type FetchMessagePayload = {
  paramKey: string;
  paramValue: string;
  limit: number;
  cursor?: string;
  onlyPinned?: boolean;
};

export function useMessage() {
  const { user } = useUser();

  const queryClient = useQueryClient();

  const createMessageMutation = useMutation({
    mutationFn: messageApi.createMessage,

    onMutate: async payload => {
      const paramKey = payload.channelId ? "channelId" : "conversationId";
      const paramValue = payload.channelId ?? payload.conversationId ?? "";
      const queryKey = ["messages", paramKey, paramValue, false] as const;

      // stop ongoing refetch
      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData(queryKey);

      // optimistic message object
      const optimisticMessage = {
        _id: uuid(), // temporary id
        conversation: payload.conversationId,
        channelId: payload.channelId,
        content: payload.content,
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
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page: any, index: number) => {
            if (index !== 0) return page;

            return {
              ...page,
              data: {
                ...page.data,
                messages: [...page.data.messages, optimisticMessage]
              }
            };
          })
        };
      });

      return { previousData, optimisticId: optimisticMessage._id, queryKey };
    },

    onSuccess: (res, payload, context) => {
      const queryKey = context?.queryKey as
        | readonly [string, string, string, boolean]
        | undefined;

      if (!queryKey) return;

      queryClient.setQueryData(queryKey, (old: any) => {
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
      const queryKey = context?.queryKey as
        | readonly [string, string, string, boolean]
        | undefined;

      if (!queryKey) return;

      queryClient.setQueryData(queryKey, context?.previousData);
    },

    onSettled: (_data, _err, payload) => {
      const paramKey = payload.channelId ? "channelId" : "conversationId";
      const paramValue = payload.channelId ?? payload.conversationId ?? "";

      queryClient.invalidateQueries({
        queryKey: ["messages", paramKey, paramValue, false]
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
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

  const reactMessageMutation = useMutation({
    mutationFn: async (data: { messageId: string; reaction: string }) => {
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
    isMessageDeleting: deleteMessageMutation.isPending,

    reactMessage: reactMessageMutation.mutateAsync,
    isMessageReacting: reactMessageMutation.isPending
  };
}

// export function useInfiniteMessages({
//   conversationId,
//   limit = 50,
//   cursor: initialCursor
// }: FetchMessagePayload) {
//   const initialPageParam = initialCursor ?? null;

//   return useInfiniteQuery<FetchMessagesResponse>({
//     queryKey: ["messages", conversationId, initialPageParam],
//     queryFn: async ({ pageParam }) => {
//       const res = await messageApi.fetchMessages({
//         conversationId,
//         limit,
//         cursor: pageParam != null ? String(pageParam) : undefined
//       });

//       return res as FetchMessagesResponse;
//     },
//     initialPageParam,
//     getNextPageParam: lastPage => lastPage.data.nextCursor ?? undefined,
//     enabled: !!conversationId
//   });
// }

export function useInfiniteMessages({
  paramKey,
  paramValue,
  limit = 50,
  onlyPinned = false
}: Omit<FetchMessagePayload, "cursor">) {
  return useInfiniteQuery<FetchMessagesResponse>({
    queryKey: ["messages", paramKey, paramValue, onlyPinned],

    queryFn: async ({ pageParam }) => {
      const res = await messageApi.fetchMessages({
        paramKey,
        paramValue,
        limit,
        cursor: String(pageParam),
        onlyPinned
      });

      return res as FetchMessagesResponse;
    },

    getNextPageParam: lastPage => {
      return lastPage.data.nextCursor ?? undefined;
    },

    initialPageParam: undefined,

    enabled: !!paramValue
  });
}
