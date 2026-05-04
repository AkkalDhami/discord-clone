"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import {
  DateSeparator,
  MessageCard,
  ShimmerMessageCard
} from "@/components/messages/message-card";
import { useInfiniteMessages } from "@/hooks/use-message";
import { getDateKey } from "@/utils/date";
import { Spinner } from "@/components/ui/spinner";

export function MessagesSection({
  conversationId
}: {
  conversationId: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [showJumpToPresent, setShowJumpToPresent] = useState(false);
  const [isInitialScrollDone, setIsInitialScrollDone] = useState(false);

  const isFetchingRef = useRef(false);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteMessages({
      conversationId,
      limit: 10
    });

  const messages =
    data?.pages.flatMap(page => page?.data?.messages ?? []) ?? [];

  // ✅ Initial scroll to bottom
  useEffect(() => {
    const container = containerRef.current;
    if (!container || isLoading || isInitialScrollDone) return;

    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
      setIsInitialScrollDone(true);
    });
  }, [isLoading, isInitialScrollDone]);

  // ✅ Scroll handler (top = load older, bottom = hide jump button)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = async () => {
      const isNearTop = container.scrollTop <= 50;

      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <=
        50;

      // ✅ show button only when NOT at bottom
      setShowJumpToPresent(!isNearBottom);

      // ✅ prevent double fetch
      if (
        isNearTop &&
        hasNextPage &&
        !isFetchingNextPage &&
        !isFetchingRef.current
      ) {
        isFetchingRef.current = true;

        const prevScrollHeight = container.scrollHeight;

        await fetchNextPage();

        requestAnimationFrame(() => {
          const newScrollHeight = container.scrollHeight;

          // ✅ preserve scroll position after prepend
          container.scrollTop =
            newScrollHeight - prevScrollHeight + container.scrollTop;

          isFetchingRef.current = false;
        });
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // ✅ Auto-scroll only if already near bottom
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isInitialScrollDone) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <=
      100;

    if (isNearBottom) {
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
    }
  }, [messages.length, isInitialScrollDone]);

  const scrollToBottom = (smooth = true) => {
    const container = containerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: smooth ? "smooth" : "auto"
    });
  };

  return (
    <div className="relative">
      <div ref={containerRef} className="flex h-full w-full flex-col pt-2">
        {isFetchingNextPage && (
          <div className="text-muted-foreground flex w-full items-center justify-center gap-2 py-2 text-sm">
            <Spinner /> Loading more...
          </div>
        )}

        {isLoading
          ? Array.from({ length: 20 }).map((_, i) => (
              <ShimmerMessageCard key={i} />
            ))
          : messages.length > 0 &&
            messages.filter(Boolean).map((message, index) => {
              const prev = messages[index - 1];

              const currentDate = getDateKey(message?.createdAt ?? new Date());
              const prevDate = prev
                ? getDateKey(prev?.createdAt ?? new Date())
                : null;

              const showDateSeparator = currentDate !== prevDate;

              const isSameAuthor = prev?.sender?._id === message?.sender?._id;

              const isWithinTimeWindow =
                prev &&
                new Date(message?.createdAt ?? new Date()).getTime() -
                  new Date(prev?.createdAt ?? new Date()).getTime() <
                  5 * 60 * 1000;

              const isGrouped = isSameAuthor && isWithinTimeWindow;

              return (
                <Fragment key={message?._id}>
                  {showDateSeparator && (
                    <DateSeparator date={message?.createdAt} />
                  )}

                  <MessageCard {...message} grouped={isGrouped} />
                </Fragment>
              );
            })}
      </div>

      {showJumpToPresent && (
        <div className="bg-secondary absolute right-4 bottom-4 rounded-lg border border-neutral-500/40 px-3 py-1.5">
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
