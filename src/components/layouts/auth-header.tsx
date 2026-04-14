"use client";

import { Button } from "@/components/ui/button";
import ThemeToggle from "./theme-toggle";
import { IconArrowLeft } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

const AuthHeader = () => {
  const router = useRouter();
  return (
    <header className="bg-background mb-3 w-full rounded-md px-2 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between py-2">
        <Button onClick={() => router.back()} variant="ghost">
          <IconArrowLeft className="size-4" />
          Back
        </Button>
        <ThemeToggle />
      </nav>
    </header>
  );
};

export default AuthHeader;
