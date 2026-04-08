import { MemberSidebar } from "@/components/layouts/member-sidebar";
import { MobileMemberSidebar } from "@/components/layouts/mobile-member-sidebar";
import { MobileServerSidebar } from "@/components/layouts/mobile-server-sidebar";
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
    <section className="flex min-h-screen w-full">
      <aside className="border-edge fixed inset-y-0 z-20 hidden h-full w-86 flex-col border-x pt-8 md:flex">
        <ServerSidebar serverId={serverId} />
      </aside>
      <div className="fixed bg-background top-3 left-3 z-20 md:hidden">
        <MobileServerSidebar serverId={serverId} />
      </div>
      <main className="border-edge h-full flex-1 border-x md:pl-86 lg:pr-80">
        {children}
      </main>

      <aside className="fixed right-0 z-20 hidden h-full w-80 flex-col border-x pt-8 lg:flex">
        <MemberSidebar serverId={serverId} />
      </aside>
      <div className="fixed top-3 right-3 z-20 lg:hidden">
        <MobileMemberSidebar serverId={serverId} />
      </div>
    </section>
  );
}
