import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as serverApi from "@/lib/api/server";

export function useServer() {
  const queryClient = useQueryClient();

  const createServerMutation = useMutation({
    mutationFn: serverApi.createServer,
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

  return {
    createServer: createServerMutation.mutateAsync,
    createServerLoading: createServerMutation.isPending,
    generateInviteLink: generateInviteLinkMutation.mutateAsync,
    generateInviteLinkLoading: generateInviteLinkMutation.isPending
  };
}
