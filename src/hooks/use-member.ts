import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as memberApi from "@/lib/api/member";
import MemberRole from "@/enums/role.enum";

export function useMember() {
  const queryClient = useQueryClient();

  const updateMemberRoleMutation = useMutation({
    mutationFn: ({ url, role }: { url: string; role: MemberRole }) =>
      memberApi.updateMemberRole(url, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["server", "me"] });
    }
  });

  const deleteMemberMutation = useMutation({
    mutationFn: ({ url }: { url: string }) => memberApi.deleteMember(url),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["server", "me"] });
    }
  });

  return {
    updateMemberRole: updateMemberRoleMutation.mutateAsync,
    isRoleUpdating: updateMemberRoleMutation.isPending,

    deleteMember: deleteMemberMutation.mutateAsync,
    isMemberDeleting: deleteMemberMutation.isPending
  };
}
