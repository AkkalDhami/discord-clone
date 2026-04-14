import { z, ZodType } from "zod";

type ValidationResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      errors: Record<string, string[]>;
    };

export function validateRequest<TSchema extends ZodType>(
  schema: TSchema,
  input: unknown
): ValidationResult<z.infer<TSchema>> {
  const result = schema.safeParse(input);

  if (result.success) {
    return {
      success: true,
      data: result.data
    };
  }

  const formattedErrors: Record<string, string[]> = {};

  result.error.issues.forEach(err => {
    const key = err.path.join(".") || "root";

    if (!formattedErrors[key]) {
      formattedErrors[key] = [];
    }

    formattedErrors[key].push(err.message);
  });

  return {
    success: false,
    errors: formattedErrors
  };
}
