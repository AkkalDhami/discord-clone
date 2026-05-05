import { ServerPreviewResponse } from "@/interface/response";
import { useQuery } from "@tanstack/react-query";

export function useInvitePreview({ inviteId }: { inviteId?: string | null }) {
  return useQuery({
    queryKey: ["invite-preview", inviteId],
    queryFn: async () => {
      const res = await fetch(`/api/invite/${inviteId}`);
      return res.json() as Promise<ServerPreviewResponse>;
    },
    enabled: !!inviteId
  });
}
