 
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as friendApi from "@/lib/api/friend";
import { ApiResponse } from "@/interface/response";
import {
  SendFriendRequestType,
  UpdateFriendRequestStatusType
} from "@/validators/friends";

export function useFriend(search?: string) {
  const queryClient = useQueryClient();

  const getFriendRequestsQuery = useQuery({
    queryKey: ["friend", search],
    queryFn: () => friendApi.getFriendRequests(search as string),
    staleTime: 1000 * 30
  });

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

  const cancelFriendReqMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const res = await friendApi.cancelFriendRequest(requestId);
      return res as ApiResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friend", "me"] });
    }
  });

  // const acceptFriendReqMutation = useMutation({
  //   mutationFn: async (requestId: string) => {
  //     return friendApi.acceptFriendRequest(requestId);
  //   },

  //   onMutate: async requestId => {
  //     await queryClient.cancelQueries({ queryKey: ["friend-requests"] });

  //     const previous = queryClient.getQueriesData({
  //       queryKey: ["friend-requests"]
  //     });

  //     previous.forEach(([key, data]: any) => {
  //       queryClient.setQueryData(key, (old: any) => {
  //         if (!old) return old;

  //         return {
  //           ...old,
  //           data: {
  //             ...old.data,
  //             incoming: old.data.incoming.filter(
  //               (r: any) => r._id !== requestId
  //             )
  //           }
  //         };
  //       });
  //     });

  //     return { previous };
  //   },

  //   onError: (_err, _id, context) => {
  //     context?.previous.forEach(([key, data]: any) => {
  //       queryClient.setQueryData(key, data);
  //     });
  //   },

  //   onSettled: () => {
  //     queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
  //     queryClient.invalidateQueries({ queryKey: ["friend", "me"] });
  //   }
  // });

  const rejectFriendReqMutation = useMutation({
    mutationFn: async (data: UpdateFriendRequestStatusType) => {
      const res = await friendApi.ignoreFriendRequest(data);
      return res as ApiResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friend", "me"] });
    }
  });

  // const rejectFriendReqMutation = useMutation({
  //   mutationFn: async (data: UpdateFriendRequestStatusType) => {
  //     return friendApi.ignoreFriendRequest(data);
  //   },

  //   onMutate: async ({ requestId }) => {
  //     await queryClient.cancelQueries({ queryKey: ["friend-requests"] });

  //     const previous = queryClient.getQueriesData({
  //       queryKey: ["friend-requests"]
  //     });

  //     previous.forEach(([key, data]: any) => {
  //       queryClient.setQueryData(key, (old: any) => {
  //         if (!old) return old;

  //         return {
  //           ...old,
  //           data: {
  //             ...old.data,
  //             incoming: old.data.incoming.filter(
  //               (r: any) => r._id !== requestId
  //             )
  //           }
  //         };
  //       });
  //     });

  //     return { previous };
  //   },

  //   onError: (_err, _vars, context) => {
  //     context?.previous.forEach(([key, data]: any) => {
  //       queryClient.setQueryData(key, data);
  //     });
  //   },

  //   onSettled: () => {
  //     queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
  //   }
  // });

  const removeFriendMutation = useMutation({
    mutationFn: async (friendId: string) => {
      const res = await friendApi.removeFriend(friendId);
      return res as ApiResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friend", "me"] });
    }
  });

  const blockFriendMutation = useMutation({
    mutationFn: async (friendId: string) => {
      const res = await friendApi.blockFriend({
        friendId,
        type: "block"
      });
      return res as ApiResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friend", "me"] });
    }
  });

  const unBlockFriendMutation = useMutation({
    mutationFn: async (friendId: string) => {
      const res = await friendApi.blockFriend({
        friendId,
        type: "unblock"
      });
      return res as ApiResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friend", "me"] });
    }
  });

  return {
    getFriendRequests: getFriendRequestsQuery.data,

    sendFriendRequest: sendFriendReqMutation.mutateAsync,
    isSendingFriendRequest: sendFriendReqMutation.isPending,

    acceptFriendRequest: acceptFriendReqMutation.mutateAsync,
    isAcceptingFriendRequest: acceptFriendReqMutation.isPending,

    cancelFriendRequest: cancelFriendReqMutation.mutateAsync,
    isCancellingFriendRequest: cancelFriendReqMutation.isPending,

    ignoreFriendRequest: rejectFriendReqMutation.mutateAsync,
    isRejectingFriendRequest: rejectFriendReqMutation.isPending,

    removeFriend: removeFriendMutation.mutateAsync,
    isRemovingFriend: removeFriendMutation.isPending,

    blockFriend: blockFriendMutation.mutateAsync,
    isBlockingFriend: blockFriendMutation.isPending,

    unBlockFriend: unBlockFriendMutation.mutateAsync,
    isunBlockingFriend: unBlockFriendMutation.isPending
  };
}
