import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as channelApi from "@/lib/api/channel";
import {
  CreateChannelSchemaType,
  EditChannelSchemaType
} from "@/validators/channel";
import { ApiResponse } from "@/interface/error";

export function useChannel() {
  const queryClient = useQueryClient();

  const createChannelMutation = useMutation({
    mutationFn: ({
      serverId,
      categoryId,
      data
    }: {
      serverId: string;
      categoryId?: string;
      data: CreateChannelSchemaType;
    }) => channelApi.createChannel({ serverId, categoryId, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["server", "me"] });
    }
  });

  const editChannelMutation = useMutation({
    mutationFn: ({
      channelId,
      data
    }: {
      channelId: string;
      data: EditChannelSchemaType;
    }) => channelApi.editChannel(channelId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["server", "me"] });
    }
  });

  const deleteChannelMutation = useMutation({
    mutationFn: async (channelId: string) => {
      const res = await channelApi.deleteChannel(channelId);
      return res as ApiResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["server", "me"] });
    }
  });

  return {
    createChannel: createChannelMutation.mutateAsync,
    isChannelCreating: createChannelMutation.isPending,

    editChannel: editChannelMutation.mutateAsync,
    isChannelEditing: editChannelMutation.isPending,

    deleteChannel: deleteChannelMutation.mutateAsync,
    isChannelDeleting: deleteChannelMutation.isPending
  };
}
