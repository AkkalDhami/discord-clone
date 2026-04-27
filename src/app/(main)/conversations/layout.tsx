import { DirectChatSidebar } from "@/components/layouts/direct-chat-sidebar";

import { MobileDirectChatSidebar } from "@/components/layouts/mobile-direct-chat-sidebar";

export const dynamic = "force-dynamic";

export default async function Layout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex min-h-screen w-full">
      <aside className="border-edge bg-background fixed inset-y-0 z-20 hidden h-full w-80 flex-col border-x pt-4 sm:w-86 md:flex">
        <DirectChatSidebar />
      </aside>
      <div className="bg-background fixed top-5 left-2 z-20 sm:top-6 md:hidden">
        <MobileDirectChatSidebar />
      </div>
      <div className="border-edge mr-1 flex-1 overflow-x-auto border-r md:pl-86">
        <div>{children}</div>
      </div>
    </section>
  );
}
