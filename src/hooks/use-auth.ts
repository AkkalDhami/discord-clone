"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as authApi from "@/lib/api/auth";

export function useAuth() {
  const queryClient = useQueryClient();

  // const userQuery = useQuery({
  //   queryKey: ["auth", "me"],
  //   queryFn: authApi.getMe,
  //   retry: false,
  //   staleTime: 1000 * 60 * 5 // 5 min
  // });

  const signupMutation = useMutation({
    mutationFn: authApi.signup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    }
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    }
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.setQueryData(["auth", "me"], null);
    }
  });

  return {
    // user: userQuery.data?.data || null,
    // isLoading: userQuery.isLoading,
    // isAuthenticated: !!userQuery.data,

    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    signup: signupMutation.mutateAsync,

    loginLoading: loginMutation.isPending,
    signupLoading: signupMutation.isPending
  };
}
