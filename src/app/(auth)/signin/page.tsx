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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";

import Link from "next/link";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Spinner } from "@/components/ui/spinner";
import toast from "react-hot-toast";
import { SigninFormData, SigninSchema } from "@/validators/auth";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { OAuthSignin } from "@/components/auth/oauth-signin";
import { useUser } from "@/hooks/use-user-store";

export default function Login(): React.JSX.Element {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { login, loginLoading } = useAuth();
  const router = useRouter();

  const { setUser } = useUser();

  const form = useForm<SigninFormData>({
    resolver: zodResolver(SigninSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const isLoading =
    form.formState.isSubmitting || form.formState.isLoading || loginLoading;

  async function onSubmit(values: SigninFormData) {
    try {
      const res = await login(values);

      if (res.success) {
        toast.success(res.message || "Login successful");
        setUser({
          id: res.data.user.id,
          name: res.data.user.name,
          username: res.data.user.username,
          email: res.data.user.email,
          avatar: res.data.user.avatar
        });
        router.push("/friends");
        form.reset();
        return;
      } else {
        toast.error(res.message || "Something went wrong.");
        return;
      }
    } catch (e) {
      const error = e as { data?: { message?: string } };
      console.log({ e });
      toast.error((error?.data?.message as string) || "Something went wrong.");
    }
  }

  return (
    <Card className="relative w-full max-w-md overflow-hidden border-0">
      <CardHeader>
        <CardTitle>
          <h1 className="text-2xl font-semibold">Sign in to your account</h1>
        </CardTitle>
        <CardDescription>
          <div className="text-muted-foreground text-sm">
            Don&apos;t have an account?{" "}
            <a href="/signup" className="text-primary hover:underline">
              Sign up
            </a>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            {/* Email */}
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

            {/* Password */}
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <div className="flex justify-between">
                    <FieldLabel>Password *</FieldLabel>
                    <Link
                      href="/forgot-password"
                      className="text-primary text-sm hover:underline">
                      Forgot password?
                    </Link>
                  </div>

                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="Your password"
                      autoComplete="off"
                      aria-invalid={fieldState.invalid}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        type="button"
                        onClick={() => setShowPassword(p => !p)}
                        className="bg-transparent hover:bg-transparent dark:hover:bg-transparent">
                        {showPassword ? (
                          <IconEyeOff className="text-muted-foreground size-4" />
                        ) : (
                          <IconEye className="text-muted-foreground size-4" />
                        )}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <Button type="submit" disabled={isLoading} className="mt-4 w-full">
            {isLoading ? (
              <>
                <Spinner />
                <span className="ml-2">Signing in...</span>
              </>
            ) : (
              "Sign in"
            )}
          </Button>

          <OAuthSignin />
        </form>
      </CardContent>
    </Card>
  );
}
