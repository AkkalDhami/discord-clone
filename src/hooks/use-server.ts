import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as serverApi from "@/lib/api/server";
import { EditServerSchemaType } from "@/validators/server";
import { ApiResponse } from "@/interface/response";

export function useServer() {
  const queryClient = useQueryClient();

  const createServerMutation = useMutation({
    mutationFn: serverApi.createServer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["server", "me"] });
    }
  });

  const editServerMutation = useMutation({
    mutationFn: ({
      serverId,
      data
    }: {
      serverId: string;
      data: EditServerSchemaType;
    }) => serverApi.editServer(serverId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["server", "me"] });
    }
  });

  const generateInviteLinkMutation = useMutation({
    mutationFn: serverApi.generateInviteLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["server", "me"] });
    }
  });

  const acceptInviteMutation = useMutation({
    mutationFn: async ({
      serverId,
      inviteCode
    }: {
      serverId: string;
      inviteCode: string;
    }) => {
      const res = await serverApi.acceptInvite(serverId, inviteCode);
      return res as ApiResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["server", "me"] });
    }
  });

  const leaveServerMutation = useMutation({
    mutationFn: serverApi.leaveServer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["server", "me"] });
    }
  });

  const deleteServerMutation = useMutation({
    mutationFn: async ({ serverId }: { serverId: string }) => {
      const res = await serverApi.deleteServer(serverId);
      return res as ApiResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["server", "me"] });
    }
  });

  return {
    createServer: createServerMutation.mutateAsync,
    createServerLoading: createServerMutation.isPending,

    generateInviteLink: generateInviteLinkMutation.mutateAsync,
    generateInviteLinkLoading: generateInviteLinkMutation.isPending,

    editServer: editServerMutation.mutateAsync,
    isEditing: editServerMutation.isPending,

    acceptInvite: acceptInviteMutation.mutateAsync,
    isAccepting: acceptInviteMutation.isPending,

    leaveServer: leaveServerMutation.mutateAsync,
    isLeaving: leaveServerMutation.isPending,

    deleteServer: deleteServerMutation.mutateAsync,
    isDeleting: deleteServerMutation.isPending
  };
}
