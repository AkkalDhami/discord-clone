import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as friendApi from "@/lib/api/friend";
import { ApiResponse } from "@/interface/error";
import {
  SendFriendRequestType,
  UpdateFriendRequestStatusType
} from "@/validators/friends";

export function useFriend() {
  const queryClient = useQueryClient();

  const sendFriendReqMutation = useMutation({
    mutationFn: async (data: SendFriendRequestType) => {
      const res = await friendApi.sendFriendRequest(data);
      return res as ApiResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friend", "me"] });
    }
  });

  const acceptFriendReqMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const res = await friendApi.acceptFriendRequest(requestId);
      return res as ApiResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friend", "me"] });
    }
  });

  const rejectFriendReqMutation = useMutation({
    mutationFn: async (data: UpdateFriendRequestStatusType) => {
      const res = await friendApi.ignoreFriendRequest(data);
      return res as ApiResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friend", "me"] });
    }
  });

  // const blockFriendReqMutation = useMutation({
  //   mutationFn: async (
  //     data: Pick<UpdateFriendRequestStatusType, "requestId">
  //   ) => {
  //     const res = await friendApi.ignoreFriendRequest({
  //       ...data,
  //       type: "block"
  //     });
  //     return res as ApiResponse;
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["friend", "me"] });
  //   }
  // });

  // const unBlockFriendReqMutation = useMutation({
  //   mutationFn: async (
  //     data: Pick<UpdateFriendRequestStatusType, "requestId">
  //   ) => {
  //     const res = await friendApi.ignoreFriendRequest({
  //       requestId: data.requestId,
  //       type: "unblock"
  //     });
  //     return res as ApiResponse;
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["friend", "me"] });
  //   }
  // });

  return {
    sendFriendRequest: sendFriendReqMutation.mutateAsync,
    isSendingFriendRequest: sendFriendReqMutation.isPending,

    acceptFriendRequest: acceptFriendReqMutation.mutateAsync,
    isAcceptingFriendRequest: acceptFriendReqMutation.isPending,

    ignoreFriendRequest: rejectFriendReqMutation.mutateAsync,
    isRejectingFriendRequest: rejectFriendReqMutation.isPending

    // blockFriendRequest: blockFriendReqMutation.mutateAsync,
    // isblockingFriendRequest: blockFriendReqMutation.isPending,

    // unBlockFriendRequest: unBlockFriendReqMutation.mutateAsync,
    // isunBlockingFriendRequest: unBlockFriendReqMutation.isPending
  };
}
