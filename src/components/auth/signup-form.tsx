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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { SignupFormData, SignupSchema } from "@/validators/auth";
import { Error } from "@/interface/response";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { useUser } from "@/hooks/use-user-store";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { OAuthSignin } from "@/components/auth/oauth-signin";

export function SignupForm() {
  const { signup, signupLoading } = useAuth();
  const router = useRouter();
  const { setUser } = useUser();

  async function onSubmit(values: SignupFormData) {
    try {
      const res = await signup(values);
      if (res.success) {
        toast.success(res.message || "Singup successful");
        setUser({
          id: res.user._id,
          name: res.user.name,
          username: res.user.username,
          email: res.user.email,
          avatar: res.user.avatar
        });
        router.push("/signin");
      } else {
        toast.error(res.message || "Something went wrong.");
      }
    } catch (error: unknown) {
      toast.error((error as Error)?.data?.message || "Something went wrong.");
    }
  }

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      username: ""
    }
  });

  const isLoading = form.formState.isSubmitting || signupLoading;

  return (
    <Card
      className={cn(
        "relative w-full max-w-md overflow-hidden border-0",
        "shadow-tertiary dark:shadow-tertiary"
      )}>
      <CardHeader>
        <CardTitle>
          <h1 className="text-2xl font-bold">Create an account</h1>
        </CardTitle>
        <CardDescription>
          <div className="text-muted-foreground text-sm">
            Already have an account?{" "}
            <a href="/signin" className="text-primary hover:underline">
              Sign in
            </a>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-0">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <div className="grid gap-2 sm:grid-cols-2">
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Name *</FieldLabel>
                    <Input
                      {...field}
                      placeholder="John Doe"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="username"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Username *</FieldLabel>
                    <Input
                      {...field}
                      placeholder="john_doe"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

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
                  <FieldLabel>Password *</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="Your password"
                      aria-invalid={fieldState.invalid}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        type="button"
                        onClick={() => setShowPassword(p => !p)}>
                        {showPassword ? (
                          <IconEyeOff size={16} />
                        ) : (
                          <IconEye size={16} />
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

            {/* Confirm Password */}
            <Controller
              name="confirmPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Confirm Password *</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      aria-invalid={fieldState.invalid}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        type="button"
                        onClick={() => setShowConfirmPassword(p => !p)}>
                        {showConfirmPassword ? (
                          <IconEyeOff size={16} />
                        ) : (
                          <IconEye size={16} />
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
                <span className="ml-2">Signing up...</span>
              </>
            ) : (
              "Sign Up"
            )}
          </Button>

          <OAuthSignin />
        </form>
      </CardContent>
    </Card>
  );
}
