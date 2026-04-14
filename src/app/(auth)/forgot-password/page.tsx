"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError
} from "@/components/ui/field";

import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";

import Link from "next/link";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Spinner } from "@/components/ui/spinner";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/use-auth";
import {
  ForgotPasswordFormData,
  ForgotPasswordSchema,
  VerifyResetOtpFormData
} from "@/validators/auth";
import { IconRefresh } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { InputOtp } from "@/components/ui/input-otp";
import { useUser } from "@/hooks/use-user-store";

export default function Page(): React.JSX.Element {
  const {
    forgotPassword,
    forgotPasswordLoading,
    verifyResetOtp,
    verifyResetOtpLoading
  } = useAuth();

  const { otp, setOtp } = useUser();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: ""
    }
  });

  const [otpCode, setOtpCode] = useState("");

  const handleOtpChange = (value: string) => {
    setOtpCode(value);
  };

  const isLoading =
    form.formState.isSubmitting ||
    form.formState.isLoading ||
    forgotPasswordLoading;

  async function onSubmit(values: ForgotPasswordFormData) {
    try {
      const res = await forgotPassword(values);
      if (res.success) {
        setOtp({
          email: values.email,
          type: "reset-password"
        });
        form.reset();
        toast.success(res.message || "Reset code sent");
      } else {
        toast.error(res.message || "Something went wrong.");
      }
    } catch (e) {
      const error = e as { data?: { message?: string } };
      toast.error((error?.data?.message as string) || "Something went wrong.");
    }
  }

  async function verifyResetOtpSubmit(values: VerifyResetOtpFormData) {
    try {
      const res = await verifyResetOtp(values);
      if (res.success) {
        toast.success(res.message || "Password reset otp verified");
        setOtp({
          type: null,
          email: null
        });
        setOtpCode("");
      } else {
        toast.error(res.message || "Something went wrong.");
      }
    } catch (e) {
      const error = e as { data?: { message?: string } };
      toast.error((error?.data?.message as string) || "Something went wrong.");
    }
  }

  return (
    <Card className="relative w-full max-w-md overflow-hidden border-0">
      {!(otp.type === "reset-password" && otp.email) ? (
        <>
          <CardHeader>
            <CardTitle>
              <h1 className="text-2xl font-semibold">Forgot password?</h1>
            </CardTitle>
            <CardDescription>
              Enter your email and we&apos;ll send you instructions to reset
              your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup>
                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Email *</FieldLabel>
                      <Input
                        {...field}
                        placeholder="john@example.com"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>

              <Button
                type="submit"
                disabled={isLoading}
                className="mt-4 w-full">
                {isLoading ? (
                  <>
                    <Spinner />
                    <span className="ml-2">Sending code...</span>
                  </>
                ) : (
                  "Send Reset Code"
                )}
              </Button>
            </form>

            <div className="text-muted-foreground mt-3">
              Remembered your password?{" "}
              <Link href="/signin" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </>
      ) : (
        <>
          <CardHeader>
            <CardTitle>
              <h1 className="text-2xl font-semibold">Email Verification</h1>
            </CardTitle>
            <CardDescription>
              A reset code has been sent to{" "}
              <span className="text-primary">{`<${otp.email}>`}</span>.
            </CardDescription>
            <CardDescription>
              Please enter the code below to verify your identity and reset your
              password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InputOtp onChange={handleOtpChange} length={6} />

            <Button
              onClick={() =>
                verifyResetOtpSubmit({
                  email:
                    otp.type === "reset-password" ? (otp.email as string) : "",
                  otp: otpCode
                })
              }
              disabled={
                otpCode.length !== 6 ||
                !(otp.email as string)?.trim() ||
                verifyResetOtpLoading
              }
              className="bg-primary-500 hover:bg-primary-600 mt-4 w-full rounded-md px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-zinc-400 sm:h-10">
              {verifyResetOtpLoading ? (
                <>
                  <Spinner /> <span>Verifying...</span>
                </>
              ) : (
                "Verify OTP"
              )}
            </Button>

            <div className="text-muted-foreground mt-3 flex flex-wrap items-center gap-2">
              Did you not receive the email?{" "}
              <Button
                onClick={() =>
                  onSubmit({
                    email:
                      otp.type === "reset-password" ? (otp.email as string) : ""
                  })
                }
                disabled={isLoading || verifyResetOtpLoading}
                variant={"link"}
                className="text-primary flex items-center justify-center gap-1 hover:underline">
                Resend code
                <IconRefresh
                  className={cn(
                    "size-4",
                    forgotPasswordLoading && "animate-spin"
                  )}
                />
              </Button>
            </div>

            <div className="text-muted-foreground mt-1">
              Remembered your password?{" "}
              <Link href="/signin" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </>
      )}
    </Card>
  );
}
