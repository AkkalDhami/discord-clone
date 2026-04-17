import { SearchConversation } from "@/components/common/search-conversation";

export function DirectChatHeader() {
  return (
    <div className="border-edge flex w-full justify-between gap-4 border-y py-2">
      <SearchConversation />
    </div>
  );
}
