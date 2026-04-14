"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname, useRouter } from "next/navigation";
import { useServer } from "@/hooks/use-server";
import toast from "react-hot-toast";
import { Spinner } from "@/components/ui/spinner";

type InviteCardProps = {
  inviterName: string;
  serverName: string;
  memberCount: number;
  serverLogo?: string;
  userAvatar?: string;
};

export function InviteCard({
  inviterName,
  serverName,
  memberCount,
  serverLogo,
  userAvatar,
  serverId
}: InviteCardProps & { serverId: string }) {
  const router = useRouter();
  const path = usePathname();
  const { acceptInvite, isAccepting } = useServer();
  const inviteCode = path.split("/")[path.split("/").length - 1];
  const handleAccept = async () => {
    try {
      const res = await acceptInvite({ serverId, inviteCode });
      if (res.success) {
        toast.success(res.message || "Joined server successfully");
        router.push(`/servers/${serverId}`);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to join server");
    }
  };
  return (
    <Card className="shadow-secondary m-4 w-full max-w-[420px] rounded-2xl bg-neutral-100 dark:bg-neutral-900">
      <CardContent className="flex flex-col items-center space-y-5 text-center">
        <Avatar className="size-18">
          <AvatarImage src={userAvatar} />
          <AvatarFallback
            className={"bg-indigo-500 text-xl font-medium text-white"}>
            {inviterName.slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Invite text */}
        <p className="text-muted-primary text-lg">
          <span className="font-medium">{inviterName}</span> invited you to join
        </p>

        <div className="flex items-center gap-2">
          <Avatar className="size-10 rounded-lg">
            <AvatarImage src={serverLogo} className={"rounded-lg"} />
            <AvatarFallback
              className={"bg-secondary rounded-lg text-xl font-medium"}>
              {serverName.slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-xl font-semibold">{serverName}</span>
        </div>

        <div className="text-muted-primary flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <span className="bg-muted-foreground h-2 w-2 rounded-full" />
            <span className="font-medium">
              {memberCount} Member{memberCount > 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <Button
          onClick={handleAccept}
          disabled={isAccepting}
          className="w-full rounded-lg bg-indigo-500 py-5 text-base font-medium text-white hover:bg-indigo-600">
          {isAccepting ? (
            <>
              <Spinner />
              Joining...
            </>
          ) : (
            "Accept Invite"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
