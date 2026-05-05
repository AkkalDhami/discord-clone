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
import { useModal } from "@/hooks/use-modal-store";
import { cn } from "@/lib/utils";

export function MessagesSection({
  conversationId
}: {
  conversationId: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { isOpen, type: modalType } = useModal();
  const isSidebarOpen = isOpen && modalType === "profile-sidebar";

  const [showJumpToPresent, setShowJumpToPresent] = useState(false);
  const [isInitialScrollDone, setIsInitialScrollDone] = useState(false);

  const isFetchingRef = useRef(false);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteMessages({
      conversationId,
      limit: 80
    });

  const messages =
    data?.pages.flatMap(page => page?.data?.messages ?? []) ?? [];

  useEffect(() => {
    const container = containerRef.current;
    if (!container || isLoading || isInitialScrollDone) return;

    requestAnimationFrame(() => {
      container.scrollIntoView({
        behavior: "auto"
      });
      setIsInitialScrollDone(true);
    });
  }, [isLoading, isInitialScrollDone]);

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

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = async () => {
      const isNearTop = container.scrollTop <= 10;

      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <=
        20;

      setShowJumpToPresent(!isNearBottom);

      if (
        isNearTop &&
        hasNextPage &&
        !isFetchingNextPage &&
        !isFetchingRef.current
      ) {
        isFetchingRef.current = true;

        const prevScrollHeight = container.scrollHeight;
        const prevScrollTop = container.scrollTop;

        await fetchNextPage();

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const newScrollHeight = container.scrollHeight;

            container.scrollTop =
              prevScrollTop + (newScrollHeight - prevScrollHeight);

            isFetchingRef.current = false;
          });
        });
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const scrollToBottom = (smooth = true) => {
    const container = containerRef.current;
    if (!container) return;

    container.scrollIntoView({
      behavior: smooth ? "smooth" : "auto"
    });
  };

  return (
    <div className={cn("relative", isSidebarOpen && "pr-82")}>
      <div className="flex h-full w-full flex-col pt-2">
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

              const isGrouped =
                isSameAuthor && isWithinTimeWindow && !message?.replyTo;

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
        <div
          onClick={() => scrollToBottom(true)}
          className="bg-secondary sticky right-4 bottom-4 mx-auto w-fit cursor-pointer rounded-xl border border-neutral-500/30 px-3 py-1.5 text-sm font-normal">
          You&apos;re viewing older messages
          <button className="bg-primary-500 hover:bg-primary-600 ml-3 cursor-pointer rounded-lg p-2 text-xs text-white">
            Jump to Present
          </button>
        </div>
      )}

      <div ref={containerRef} id="messages-container" className="mb-4" />
    </div>
  );
}
