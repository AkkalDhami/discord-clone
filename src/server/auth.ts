"use server";

import { signIn } from "next-auth/react";

export const signInWithGoogle = async () => {
  await signIn("google", {
    callbackUrl: "/"
    // redirectTo: "/"
  });
};
