"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as authApi from "@/lib/api/auth";
import {
  ForgotPasswordFormData,
  ResetPasswordFormData,
  VerifyResetOtpFormData
} from "@/validators/auth";
import { ApiResponse } from "@/interface/error";

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

  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: ForgotPasswordFormData) => {
      const res = await authApi.forgotPassword(data);
      return res as ApiResponse;
    }
  });

  const verifyResetOtpMutation = useMutation({
    mutationFn: async (data: VerifyResetOtpFormData) => {
      const res = await authApi.verifyResetOtp(data);
      return res as ApiResponse;
    }
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetPasswordFormData) => {
      const res = await authApi.resetPassword(data);
      return res as ApiResponse;
    }
  });

  return {
    // user: userQuery.data?.data || null,
    // isLoading: userQuery.isLoading,
    // isAuthenticated: !!userQuery.data,

    login: loginMutation.mutateAsync,

    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,

    signup: signupMutation.mutateAsync,

    loginLoading: loginMutation.isPending,
    signupLoading: signupMutation.isPending,

    forgotPassword: forgotPasswordMutation.mutateAsync,
    forgotPasswordLoading: forgotPasswordMutation.isPending,

    verifyResetOtp: verifyResetOtpMutation.mutateAsync,
    verifyResetOtpLoading: verifyResetOtpMutation.isPending,

    resetPassword: resetPasswordMutation.mutateAsync,
    resetPasswordLoading: resetPasswordMutation.isPending
  };
}
