"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { IconRefresh } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { InputOtp } from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/use-auth";
import { useUser } from "@/hooks/use-user-store";

export function VerifyEmail() {
  const router = useRouter();
  const { otp, setOtp } = useUser();
  const {
    verifyEmail,
    verifyEmailLoading,
    resendVerificationOtp,
    resendVerificationOtpLoading
  } = useAuth();
  const [otpCode, setOtpCode] = useState("");

  useEffect(() => {
    if (otp?.type !== "verify-email" || !otp.email) {
      router.replace("/signup");
    }
  }, [otp?.type, otp?.email, router]);

  const handleOtpChange = (otpValue: string) => {
    setOtpCode(otpValue);
  };

  async function handleVerify() {
    if (!otp?.email || otpCode.length !== 6) {
      return;
    }

    try {
      const res = await verifyEmail({
        email: otp.email,
        otpCode
      });

      if (res.success) {
        toast.success(res.message || "Email verified successfully");
        setOtp(null);
        setOtpCode("");
        router.push("/signin");
        return;
      }

      toast.error(res.message || "Something went wrong.");
    } catch (error: unknown) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        "Something went wrong.";
      toast.error(message);
    }
  }

  async function handleResend() {
    if (!otp?.email) {
      return;
    }

    try {
      const res = await resendVerificationOtp(otp.email);

      if (res.success) {
        toast.success(res.message || "Verification code resent");
        return;
      }

      toast.error(res.message || "Something went wrong.");
    } catch (error: unknown) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        "Something went wrong.";
      toast.error(message);
    }
  }

  if (otp?.type !== "verify-email" || !otp.email) {
    return null;
  }

  return (
    <Card className="relative w-full max-w-md overflow-hidden border-0">
      <CardHeader>
        <CardTitle>
          <h1 className="text-2xl font-semibold">Verify your email</h1>
        </CardTitle>
        <CardDescription>
          We sent a 6-digit code to{" "}
          <span className="text-primary">{otp.email}</span>.
        </CardDescription>
        <CardDescription>
          Enter the code below to verify your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <InputOtp length={6} onChange={handleOtpChange} />
        </div>

        <Button
          onClick={handleVerify}
          disabled={otpCode.length !== 6 || verifyEmailLoading}
          className="w-full">
          {verifyEmailLoading ? (
            <>
              <Spinner />
              <span className="ml-2">Verifying...</span>
            </>
          ) : (
            "Verify Email"
          )}
        </Button>

        <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
          Didn&apos;t get the code?{" "}
          <Button
            variant="link"
            onClick={handleResend}
            disabled={resendVerificationOtpLoading}
            className="text-primary h-auto p-0 hover:underline">
            {resendVerificationOtpLoading ? (
              <span className="flex items-center gap-1">
                <Spinner />
                Sending...
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <IconRefresh className="size-4" />
                Resend code
              </span>
            )}
          </Button>
        </div>

        <div className="text-muted-foreground text-sm">
          Return to{" "}
          <Link href="/signup" className="text-primary hover:underline">
            sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
