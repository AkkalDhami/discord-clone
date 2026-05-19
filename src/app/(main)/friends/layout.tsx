import { DirectChatHeader } from "@/components/chat/direct-chat-header";
import { DirectChatSidebar } from "@/components/layouts/direct-chat-sidebar";
import { FriendRightSidebar } from "@/components/layouts/friend-right-sidebar";

import { MobileDirectChatSidebar } from "@/components/layouts/mobile-direct-chat-sidebar";
import { currentAuthUser } from "@/helpers/auth.helper";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Layout({
  children
}: {
  children: React.ReactNode;
}) {
  const currentUser = await currentAuthUser();

  if (!currentUser) {
    return redirect("/signin");
  }

  return (
    <section className="flex min-h-screen w-full">
      <aside className="border-edge bg-background fixed inset-y-0 z-20 hidden h-full w-80 flex-col border-x pt-4 sm:w-86 md:flex">
        <DirectChatSidebar />
      </aside>
      <div className="bg-background fixed top-6 left-2 z-20 md:hidden">
        <MobileDirectChatSidebar />
      </div>
      <div className="border-edge mr-1 flex-1 overflow-x-auto border-r md:pl-86">
        <DirectChatHeader />

        <div> {children}</div>
      </div>

      {/* <aside className="border-edge bg-background fixed right-1 z-20 hidden h-full w-80 flex-col border-x pt-4 lg:flex">
      </aside> */}
    </section>
  );
}
