import { ScrollArea } from "@/components/ui/scroll-area";
import { DirectChatSection } from "@/components/chat/direct-chat-section";

import { DirectChatItemSection } from "@/components/chat/direct-chat-item-section";
import { DirectChatSidebarHeader } from "@/components/layouts/direct-chat-sidebar-header";

export const dynamic = "force-dynamic";

export async function DirectChatSidebar() {
  return (
    <div className="text-primary border-edge bg-background mb-4 flex h-full w-full flex-col border-b pt-12.75 pb-4 md:pt-0">
      <DirectChatSidebarHeader />
      <DirectChatItemSection />
      <ScrollArea className={"h-[calc(100vh-120px)] pb-4"}>
        <DirectChatSection />
      </ScrollArea>
    </div>
  );
}
