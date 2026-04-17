import { DirectChatHeader } from "@/components/chat/direct-chat-header";
import { DirectChatSidebar } from "@/components/layouts/direct-chat-sidebar";

import { MobileDirectChatSidebar } from "@/components/layouts/mobile-direct-chat-sidebar";
// import Conversation from "@/models/conversation.model";


export default async function Layout({
  children
}: {
  children: React.ReactNode;
}) {

  // const conversation = await Conversation

  return (
    <section className="flex min-h-screen w-full">
      <aside className="border-edge bg-background fixed inset-y-0 z-20 hidden h-full w-80 flex-col border-x pt-4 sm:w-86 md:flex">
        <DirectChatSidebar />
      </aside>
      <div className="bg-background fixed top-6 left-2 z-20 md:hidden">
        <MobileDirectChatSidebar />
      </div>
      <div className="flex-1 overflow-x-auto md:pl-86 lg:pr-80">
        <DirectChatHeader />
        {children}
      </div>

      {/* <aside className="border-edge bg-background fixed right-1 z-20 hidden h-full w-80 flex-col border-x pt-4 lg:flex">
        <MemberSidebar serverId={serverId} />
      </aside>
      <div className="fixed top-6 right-2 z-20 lg:hidden">
        <MobileMemberSidebar serverId={serverId} />
      </div> */}
    </section>
  );
}
