import { ServerSidebar } from "@/components/layouts/server-sidebar";
import { currentAuthUser } from "@/helpers/auth.helper";
import Member from "@/models/member.model";

import { redirect } from "next/navigation";

export default async function ServerIdLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ serverId: string }>;
}) {
  const { serverId } = await params;

  const profile = await currentAuthUser();

  if (!profile) {
    return redirect("/signin");
  }

  const member = await Member.findOne({
    profileId: profile.id,
    serverId
  });

  if (!member) {
    return redirect("/");
  }

  return (
    <section>
      <div className="fixed border-x border-edge inset-y-0 z-20 hidden h-full w-80 flex-col p-3 pt-6 md:flex ">
        <ServerSidebar serverId={serverId} />
      </div>
      <main className="h-full md:pl-80">{children}</main>
    </section>
  );
}
