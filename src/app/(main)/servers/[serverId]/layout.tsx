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
      <aside className="border-edge bg-background fixed inset-y-0 z-20 hidden h-full w-80 flex-col border-x pt-4 sm:w-86 md:flex">
        <ServerSidebar serverId={serverId} />
      </aside>
      <div className="bg-background fixed top-6 left-2 z-20 md:hidden">
        <MobileServerSidebar serverId={serverId} />
      </div>
      <div className="h-full flex-1 overflow-x-auto md:pl-86 lg:pr-80">
        {/* <div className="border-edge h-full flex-1 overflow-x-auto border-x bg-neutral-100 md:pl-86 lg:pr-80 dark:bg-neutral-950"> */}
        {children}
      </div>

      <aside className="border-edge bg-background fixed right-1 z-20 hidden h-full w-80 flex-col border-x pt-4 lg:flex">
        <MemberSidebar serverId={serverId} />
      </aside>
      <div className="fixed top-6 right-2 z-20 lg:hidden">
        <MobileMemberSidebar serverId={serverId} />
      </div>
    </section>
  );
}
