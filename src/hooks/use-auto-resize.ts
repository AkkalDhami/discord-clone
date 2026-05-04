"use client";

import { useLayoutEffect } from "react";

export function useAutoResize(
  ref: React.RefObject<HTMLTextAreaElement | null>,
  value: string,
  maxHeight = 160
) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.style.height = "0px";

    const scrollHeight = el.scrollHeight;

    el.style.height = Math.min(scrollHeight, maxHeight) + "px";

    el.style.transition = "height 0.1s ease";

    if (scrollHeight > maxHeight) {
      el.style.overflowY = "auto";
    } else {
      el.style.overflowY = "hidden";
    }
  }, [value, ref, maxHeight]);
}
