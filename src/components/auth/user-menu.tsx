"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/common/user-avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useUser } from "@/hooks/use-user-store";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { UserSettingsDialog } from "@/components/dialogs/user-settings-dialog";

type UserMenuProps = {
  name?: string;
  username?: string;
  image?: string;
  email?: string;
};

export function UserMenu({ name, username, image, email }: UserMenuProps) {
  const { logout } = useAuth();
  const { user: storedUser } = useUser();
  const router = useRouter();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const profile = storedUser || { name, username, email, avatar: image };

  const handleLogout = async () => {
    try {
      router.push("/signin");
      await logout();
    } catch (error) {
      console.log(error);
      toast.error("Failed to logout");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon">
              <UserAvatar
                rounded="lg"
                name={name}
                src={image}
                className="size-9"
              />
            </Button>
          }
        />

        <DropdownMenuContent align="end" className="relative z-50 w-56">
          <div className="space-y-1 px-2 py-1.5 text-sm">
            <p className="font-medium">{profile.name || "User"}</p>
            {profile.username && (
              <p className="text-muted-foreground truncate text-xs">
                {`@${profile.username}`}
              </p>
            )}
            {profile.email && (
              <p className="text-muted-foreground truncate text-xs">
                {`${profile.email}`}
              </p>
            )}
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setSettingsOpen(true)}
            className="cursor-pointer">
            Profile Settings
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleLogout}
            className="cursor-pointer text-red-500 hover:bg-red-500/10 focus:text-red-500">
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UserSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        user={profile}
      />
    </>
  );
}
