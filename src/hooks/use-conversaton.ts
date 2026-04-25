import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as conversationApi from "@/lib/api/conversation";

import { ApiResponse } from "@/interface/response";
import {
  ConversationType,
  ConversationUpdateType,
  LeaveConversationType
} from "@/validators/conversation";

export function useConversation() {
  const queryClient = useQueryClient();

  const createConversationMutation = useMutation({
    mutationFn: async (data: ConversationType) => {
      const res = await conversationApi.createConversation(data);
      return res as ApiResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    }
  });

  const updateConversationMutation = useMutation({
    mutationFn: async (data: ConversationUpdateType) => {
      const res = await conversationApi.updateConversation(
        data.conversationId,
        { name: data.name }
      );
      return res as ApiResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    }
  });

  const addGroupMembersMutation = useMutation({
    mutationFn: async (data: {
      conversationId: string;
      participants: string[];
    }) => {
      const res = await conversationApi.addGroupMembers(
        data.conversationId,
        data.participants
      );
      return res as ApiResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["conversation"] });
    }
  });

  const removeGroupMembersMutation = useMutation({
    mutationFn: async (data: LeaveConversationType) => {
      const res = await conversationApi.removeGroupMembers(data);
      return res as ApiResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["conversation"] });
    }
  });

  const kickGroupMemberMutation = useMutation({
    mutationFn: async (data: LeaveConversationType) => {
      const res = await conversationApi.kickGroupMember(data);
      return res as ApiResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["conversation"] });
    }
  });

  return {
    createConversation: createConversationMutation.mutateAsync,
    isConversationCreating: createConversationMutation.isPending,

    updateConversation: updateConversationMutation.mutateAsync,
    isConversationUpdating: updateConversationMutation.isPending,

    addGroupMembers: addGroupMembersMutation.mutateAsync,
    isAddingGroupMembers: addGroupMembersMutation.isPending,

    removeGroupMembers: removeGroupMembersMutation.mutateAsync,
    isRemovingGroupMembers: removeGroupMembersMutation.isPending,

    kickGroupMember: kickGroupMemberMutation.mutateAsync,
    isKickingGroupMember: kickGroupMemberMutation.isPending
  };
}
