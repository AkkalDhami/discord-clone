import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as memberApi from "@/lib/api/member";
import MemberRole from "@/enums/role.enum";
import { ApiResponse } from "@/interface/response";

export function useMember() {
  const queryClient = useQueryClient();

  const updateMemberRoleMutation = useMutation({
    mutationFn: async ({
      serverId,
      memberId,
      role
    }: {
      serverId: string;
      memberId: string;
      role: MemberRole;
    }) => {
      const res = await memberApi.updateMemberRole({
        serverId,
        memberId,
        role
      });
      return res as ApiResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", "me"] });
    }
  });

  const deleteMemberMutation = useMutation({
    mutationFn: async ({
      serverId,
      memberId
    }: {
      serverId: string;
      memberId: string;
    }) => {
      const res = await memberApi.deleteMember(serverId, memberId);
      return res as ApiResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", "me"] });
    }
  });

  return {
    updateMemberRole: updateMemberRoleMutation.mutateAsync,
    isRoleUpdating: updateMemberRoleMutation.isPending,

    deleteMember: deleteMemberMutation.mutateAsync,
    isMemberDeleting: deleteMemberMutation.isPending
  };
}
