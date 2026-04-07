"use client";

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
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type UserMenuProps = {
  name?: string;
  username?: string;
  image?: string;
  email?: string;
};

export function UserMenu({ name, username, image, email }: UserMenuProps) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/signin");
    } catch (error) {
      console.log(error);
      toast.error("Failed to logout");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon">
            <UserAvatar name={name} src={image} className="size-9" />
          </Button>
        }
      />

      <DropdownMenuContent align="end" className="relative z-50 w-56">
        <div className="px-2 py-1.5 space-y-1 text-sm">
          <p className="font-medium">{name || "User"}</p>
          {username && (
            <p className="text-muted-foreground truncate text-xs">
              @{username}
            </p>
          )}
          {email && (
            <p className="text-muted-foreground truncate text-xs">{email}</p>
          )}
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-red-500 focus:text-red-500">
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
