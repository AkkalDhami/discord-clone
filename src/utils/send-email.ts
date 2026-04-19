import { ForgotPasswordEmail } from "@/components/emails/reset-password";
import { env } from "@/configs/env";
import { resend } from "@/configs/resend";

export type OtpType = "reset-password" | "verify-email";

export type SendMailBase = {
  from?: string;
  type: OtpType;
  subject: string;
  email: string;
};

export type SendMailType = SendMailBase & {
  data: {
    name: string;
    email: string;
    code: string;
  };
};

export async function sendEmail({
  from,
  email,
  subject,
  type,
  data
}: SendMailType) {
  return await resend.emails.send({
    from: from || env.EMAIL_FROM,
    to: email,
    subject,
    react:
      type === "reset-password"
        ? ForgotPasswordEmail({
            name: data.name,
            email: data.email,
            code: data.code
          })
        : null
  });
}
