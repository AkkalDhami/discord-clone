import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as channelApi from "@/lib/api/channel";
import { CreateChannelSchemaType } from "@/validators/channel";

export function useChannel() {
  const queryClient = useQueryClient();

  const createChannelMutation = useMutation({
    mutationFn: ({
      url,
      data
    }: {
      url: string;
      data: CreateChannelSchemaType;
    }) => channelApi.createChannel(url, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["server", "me"] });
    }
  });

  return {
    createChannel: createChannelMutation.mutateAsync,
    isChannelCreating: createChannelMutation.isPending
  };
}
