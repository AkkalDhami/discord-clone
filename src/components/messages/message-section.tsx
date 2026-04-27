import { MessageCard } from "@/components/messages/message-card";
import { IMessage } from "@/interface";

export function MessagesSection({ messages }: { messages: IMessage[] }) {
  return (
    <div className="mt-4 flex flex-col gap-1 pt-2">
      {messages?.length > 0 ? (
        messages.map(message => (
          <MessageCard
            content={message.content}
            createdAt={message.createdAt}
            edited={message.edited}
            isBot={message.isBot}
            isAdmin={message.isAdmin}
            sender={message.sender}
            type={message.type}
            key={message._id}
          />
        ))
      ) : (
        <div className="text-muted-foreground flex h-[50vh] items-center justify-center text-sm">
          No messages yet. Say hello!
        </div>
      )}
    </div>
  );
}
