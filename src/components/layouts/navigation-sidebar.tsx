import { currentAuthUser } from "@/helpers/auth.helper";
import Member from "@/models/member.model";
import { redirect } from "next/navigation";
import { NavigationAction } from "@/components/navigation/navigation-action";
import ThemeToggle from "./theme-toggle";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NavigationItem } from "@/components/navigation/navigation-item";
import { IServer } from "@/models/server.model";
import { Types } from "mongoose";
import { UserMenu } from "@/components/auth/user-menu";
import { cn } from "@/lib/utils";
import { DirectChatAction } from "@/components/chat/direct-chat-action";

export async function NavigationSidebar({ className }: { className?: string }) {
  const profile = await currentAuthUser();
  if (!profile) {
    return redirect("/signin");
  }

  const servers = await Member.aggregate([
    {
      $match: {
        profileId: new Types.ObjectId(profile.id)
      }
    },
    {
      $lookup: {
        from: "servers",
        localField: "serverId",
        foreignField: "_id",
        as: "servers"
      }
    },
    {
      $unwind: "$servers"
    },
    {
      $replaceRoot: { newRoot: "$servers" }
    }
  ]);

  if (!servers || servers?.length === 0) {
    return redirect("/");
  }

  return (
    <aside
      className={cn(
        "border-edge relative my-4 flex h-full flex-col items-center space-y-3 border-y pt-2 pr-1 sm:space-y-4 sm:pr-2 sm:pl-1",
        className
      )}>
      <DirectChatAction />

      <NavigationAction />
      <ScrollArea className="flex-1">
        {servers?.map((server: IServer) => (
          <NavigationItem
            key={server._id.toString()}
            id={server._id.toString()}
            logo={server.logo}
            name={server.name}
          />
        ))}
      </ScrollArea>
      <div className="absolute bottom-4 flex flex-col items-center space-y-2.5 sm:space-y-3.5">
        <UserMenu
          name={profile.name}
          email={profile.email}
          username={profile.username}
          image={profile.avatar?.url}
        />
        <ThemeToggle className="bg-transparent dark:bg-transparent dark:hover:bg-transparent" />
      </div>
    </aside>
  );
}
