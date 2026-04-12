// // import { ForgotPasswordEmail } from "@/components/emails/reset-password";
// // import { VerifyEmail } from "@/components/emails/verify-email";
// import { betterAuth } from "better-auth";
// // import { Resend } from "resend";

// import { MongoClient } from "mongodb";
// import { mongodbAdapter } from "better-auth/adapters/mongodb";

// // const resend = new Resend(process.env.RESEND_API_KEY);

// const client = new MongoClient(process.env.DATABASE_URL as string);
// const db = client.db();

// export const auth = betterAuth({
//   baseURL: process.env.BETTER_AUTH_URL,

//   // emailVerification: {
//   //   sendVerificationEmail: async ({ user, url }) => {
//   //     await resend.emails.send({
//   //       from: `${process.env.EMAIL_SENDER_NAME} <${process.env.EMAIL_SENDER_ADDRESS}>`,
//   //       to: user.email,
//   //       subject: "Verify your email",
//   //       react: VerifyEmail({
//   //         name: user.name,
//   //         url: url
//   //       })
//   //     });
//   //   },
//   //   sendOnSignUp: true
//   // },

//   socialProviders: {
//     google: {
//       clientId: process.env.GOOGLE_CLIENT_ID as string,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
//       accessType: "offline",
//       prompt: "select_account consent"
//     }
//   },

//   // emailAndPassword: {
//   //   enabled: true,
//   //   sendResetPassword: async ({ user, url }) => {
//   //     await resend.emails.send({
//   //       from: `${process.env.EMAIL_SENDER_NAME} <${process.env.EMAIL_SENDER_ADDRESS}>`,
//   //       to: user.email,
//   //       subject: "Reset your password",
//   //       react: ForgotPasswordEmail({
//   //         name: user.name,
//   //         url: url,
//   //         email: user.email
//   //       })
//   //     });
//   //   },
//   //   requireEmailVerification: true
//   // },

//   database: mongodbAdapter(db, {
//     client
//   })
// });

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID as string,
      clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  ],
  pages: {
    signIn: "/signin"
  }
});
