"use client";

import { useEffect } from "react";
import { SessionProvider as NextSessionProvider } from "next-auth/react";

import { useUser } from "@/hooks/use-user-store";
import { useAuth } from "@/hooks/use-auth";

function SessionStateSync({ children }: { children: React.ReactNode }) {
  const { user, error } = useAuth();
  const { setUser } = useUser();

  if (error) {
    console.error({ error });
  }

  // console.log({ user });

  useEffect(() => {
    if (user) {
      setUser({
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: {
          ...user.avatar
        }
      });
    }
  }, [user, setUser]);

  return <>{children}</>;
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextSessionProvider>
      <SessionStateSync>{children}</SessionStateSync>
    </NextSessionProvider>
  );
}
