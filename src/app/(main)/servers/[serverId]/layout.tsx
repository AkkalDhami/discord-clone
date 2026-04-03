import { ServerSidebar } from "@/components/layouts/server-sidebar";
import { currentAuthUser } from "@/helpers/auth.helper";
import { IMember } from "@/models/member.model";
import Server from "@/models/server.model";
import { redirect } from "next/navigation";

export default async function ServerIdLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ serverId: string }>;
}) {
  const server = await params;

  const profile = await currentAuthUser();

  if (!profile) {
    return redirect("/signin");
  }

  const serverInDb = await Server.findById(server.serverId).populate<{
    members: IMember[];
  }>("members");

  const member = serverInDb?.members.find(
    member => member?.profileId?.toString() === profile?.id?.toString()
  );

  if (!serverInDb || !member) {
    return redirect("/");
  }

  return (
    <section>
      <div className="fixed inset-y-0 z-20 hidden h-full w-60 flex-col md:flex">
        <ServerSidebar serverId={server.serverId} />
      </div>
      <main className="h-full md:pl-60">{children}</main>
    </section>
  );
}
