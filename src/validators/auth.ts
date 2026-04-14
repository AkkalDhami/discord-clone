import z from "zod";

export const emailSchema = z
  .email({ message: "Please enter a valid email address." })
  .max(100, { message: "Email must be no more than 100 characters." });

export const nameSchema = z
  .string({ error: "Name must be a string" })
  .trim()
  .min(3, {
    message: "Name must be at least 3 characters long"
  })
  .max(50, {
    message: "Name must be at most 50 characters long"
  });

export const usernameSchema = z
  .string({ error: "Username must be a string" })
  .trim()
  .min(3, {
    message: "Username must be at least 3 characters long"
  })
  .max(50, {
    message: "Username must be at most 50 characters long"
  });

export const passwordSchema = z
  .string({ error: "Password must be a string" })
  .trim()
  .min(6, {
    message: "Password must be at least 6 characters long"
  })
  .max(80, {
    message: "Password must be at most 80 characters long"
  });

export const SigninSchema = z.object({
  email: emailSchema,
  password: z.string({ error: "Password must be a string" }).trim().min(1, {
    message: "Password is required"
  })
});

export const SignupSchema = z
  .object({
    name: nameSchema,
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema
  })
  .refine(
    data => {
      return data.password === data.confirmPassword;
    },
    {
      message: "Passwords do not match",
      path: ["confirmPassword"]
    }
  );

export type SigninFormData = z.infer<typeof SigninSchema>;
export type SignupFormData = z.infer<typeof SignupSchema>;
