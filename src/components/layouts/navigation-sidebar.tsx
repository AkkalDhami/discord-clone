import { currentAuthUser } from "@/helpers/auth.helper";
import Member from "@/models/member.model";
import Server from "@/models/server.model";
import { redirect } from "next/navigation";
import { NavigationAction } from "@/components/navigation/navigation-action";
import ThemeToggle from "./theme-toggle";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NavigationItem } from "@/components/navigation/navigation-item";

export async function NavigationSidebar() {
  const profile = await currentAuthUser();
  if (!profile) {
    return redirect("/signin");
  }

  const member = await Member.findOne({
    profileId: profile.id
  }).populate("serverId");

  const server = member?.serverId;
  if (!server) {
    return redirect("/");
  }

  const servers = await Server.find({
    profileId: profile.id
  });

  return (
    <aside className="relative flex h-full w-[72px] flex-col items-center space-y-4 bg-neutral-100 p-3 pt-6 dark:bg-neutral-950">
      <NavigationAction />
      <ScrollArea className="flex-1">
        {servers.map(server => (
          <NavigationItem
            key={server._id.toString()}
            id={server._id.toString()}
            logo={server.logo}
            name={server.name}
          />
        ))}
      </ScrollArea>
      <div className="absolute bottom-4">
        <ThemeToggle className="bg-transparent dark:bg-transparent dark:hover:bg-transparent" />
      </div>
    </aside>
  );
}
