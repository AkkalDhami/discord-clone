import { ScrollArea } from "@/components/ui/scroll-area";
import { DirectChatSection } from "@/components/chat/direct-chat-section";
import { DirectChatHeader } from "@/components/chat/direct-chat-header";
import { DirectChatItemSection } from "@/components/chat/direct-chat-item-section";

export const dynamic = "force-dynamic";

export async function DirectChatSidebar() {
  return (
    <div className="text-primary border-edge bg-background mb-4 flex h-full w-full flex-col border-b pb-4">
      <DirectChatHeader />
      <DirectChatItemSection />
      <ScrollArea className={"h-[calc(100vh-120px)] pb-4"}>
        {/* <ServerSection
          memberId={member._id.toString()}
          role={role}
          server={JSON.stringify(cleanServer)}
        /> */}
        <DirectChatSection />
      </ScrollArea>
    </div>
  );
}
