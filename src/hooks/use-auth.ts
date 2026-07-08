"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery
} from "@tanstack/react-query";
import * as authApi from "@/lib/api/auth";
import {
  ChangePasswordFormData,
  ForgotPasswordFormData,
  ResetPasswordFormData,
  SigninFormData,
  VerifyResetOtpFormData
} from "@/validators/auth";
import {
  ApiResponse,
  GetMeResponse,
  SigninResponse
} from "@/interface/response";
import { UpdateUserProfile } from "@/types/auth";

export function useAuth() {
  const queryClient = useQueryClient();

  const userQuery = useSuspenseQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const res = await authApi.getMe();
      return res as GetMeResponse;
    },
    retry: false,
    staleTime: 1000 * 60 * 5 // 5 min
  });

  const signupMutation = useMutation({
    mutationFn: authApi.signup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    }
  });

  const verifyEmailMutation = useMutation({
    mutationFn: authApi.verifyEmail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    }
  });

  const resendVerificationOtpMutation = useMutation({
    mutationFn: authApi.resendVerificationOtp
  });

  const loginMutation = useMutation({
    mutationFn: async (data: SigninFormData) => {
      const res = await authApi.login(data);
      return res as SigninResponse;
    },
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

  const changePasswordMutation = useMutation({
    mutationFn: async (data: ChangePasswordFormData) => {
      const res = await authApi.changePassword(data);
      return res as ApiResponse;
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateUserProfile) => {
      const res = await authApi.updateProfile(data);
      return res as SigninResponse;
    },
    onSuccess: response => {
      if (response?.success && response?.data?.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        queryClient.setQueryData(["auth", "me"], (old: any) => {
          if (!old) {
            return response;
          }

          return {
            ...old,
            data: {
              ...old.data,
              user: {
                ...old.data?.user,
                ...response.data.user
              }
            }
          };
        });
      }
    }
  });

  return {
    user: userQuery.data?.data?.user,
    error: userQuery.error,
    isUserLoading: userQuery.isLoading,
    isAuthenticated: !!userQuery.data?.data?.user,

    login: loginMutation.mutateAsync,

    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,

    signup: signupMutation.mutateAsync,
    verifyEmail: verifyEmailMutation.mutateAsync,
    verifyEmailLoading: verifyEmailMutation.isPending,
    resendVerificationOtp: resendVerificationOtpMutation.mutateAsync,
    resendVerificationOtpLoading: resendVerificationOtpMutation.isPending,

    loginLoading: loginMutation.isPending,
    signupLoading: signupMutation.isPending,

    forgotPassword: forgotPasswordMutation.mutateAsync,
    forgotPasswordLoading: forgotPasswordMutation.isPending,

    verifyResetOtp: verifyResetOtpMutation.mutateAsync,
    verifyResetOtpLoading: verifyResetOtpMutation.isPending,

    resetPassword: resetPasswordMutation.mutateAsync,
    resetPasswordLoading: resetPasswordMutation.isPending,

    changePassword: changePasswordMutation.mutateAsync,
    changePasswordLoading: changePasswordMutation.isPending,

    updateProfile: updateProfileMutation.mutateAsync,
    updateProfileLoading: updateProfileMutation.isPending
  };
}
