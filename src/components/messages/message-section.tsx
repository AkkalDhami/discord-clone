"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCard } from "@/components/messages/message-card";
import { useInfiniteMessages } from "@/hooks/use-message";

export function MessagesSection({
  conversationId
}: {
  conversationId: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [showJumpToPresent, setShowJumpToPresent] = useState(false);
  const [isInitialScrollDone, setIsInitialScrollDone] = useState(false);

  const isNearBottomRef = useRef(true);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteMessages({
      conversationId,
      limit: 10
    });

  const messages =
    data?.pages.flatMap(page => page?.data?.messages ?? []) ?? [];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (isLoading) return;
    if (isInitialScrollDone) return;

    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
      setIsInitialScrollDone(true);
    });
  }, [isLoading, isInitialScrollDone]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = async () => {
      const isAtBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <=
        50;
      const isNearTop =
        container.scrollHeight - container.scrollTop - container.clientHeight <=
        50;

      isNearBottomRef.current = isAtBottom;
      setShowJumpToPresent(!isAtBottom);

      if (isNearTop && hasNextPage && !isFetchingNextPage) {
        const prevScrollHeight = container.scrollHeight;
        const prevScrollTop = container.scrollTop;

        await fetchNextPage();

        requestAnimationFrame(() => {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop =
            prevScrollTop + (newScrollHeight - prevScrollHeight);
        });
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const scrollToBottom = (smooth = true) => {
    const container = containerRef.current;
    if (!container) return;

    requestAnimationFrame(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: smooth ? "smooth" : "auto"
      });
    });
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (!isInitialScrollDone) return;

    const isAtBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <=
      100;

    if (isAtBottom) {
      requestAnimationFrame(() => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: "smooth"
        });
      });
    }
  }, [isInitialScrollDone, messages.length]);

  return (
    <div className="relative">
      <div
        ref={containerRef}
        id="messages-container"
        className="flex h-full flex-col-reverse gap-1 pt-2">
        {isFetchingNextPage && (
          <div className="text-muted-foreground py-2 text-center text-xs">
            Loading more...
          </div>
        )}

        {messages.length > 0 &&
          messages
            .filter(Boolean)
            .map(message => <MessageCard key={message._id} {...message} />)}
      </div>

      {showJumpToPresent && (
        <div
          className={
            "bg-secondary absolute right-4 bottom-4 rounded-lg border border-neutral-500/40 px-3 py-1.5"
          }>
          You&apos;re viewing older messages
          <button
            onClick={() => scrollToBottom(true)}
            className="bg-primary-500 hover:bg-primary-600 ml-3 cursor-pointer rounded-lg p-2 text-xs font-semibold text-white">
            Jump to Present
          </button>
        </div>
      )}
    </div>
  );
}
