"use client";

import { useEffect } from "react";
import { useAppearance } from "@/hooks/use-appearance";

const fontMap: Record<string, string> = {
  geist: "var(--font-geist-sans)",
  "geist-mono": "var(--font-geist-mono)",
  inter: "var(--font-inter)",
  "fira-sans": "var(--font-fira-sans)",
  "fira-mono": "var(--font-fira-mono)",
  roboto: "var(--font-roboto)",
  "roboto-mono": "var(--font-roboto-mono)",
  consolas: '"Consolas", monospace',
  menlo: '"Menlo", monospace',
  courier: '"Courier New", monospace',
  "source-code": "var(--font-source-code)",
  jetbrains: "var(--font-jetbrains)"
};

export function AppearanceProvider() {
  const { theme, fontFamily } = useAppearance();

  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;

    // Apply font family
    if (fontFamily && fontMap[fontFamily]) {
      root.style.fontFamily = fontMap[fontFamily];
      root.setAttribute("data-font", fontFamily);
    }

    // Apply theme
    if (theme) {
      root.setAttribute("data-theme", theme);

      // Update the HTML class for next-themes compatibility
      if (theme === "light") {
        root.classList.remove("dark");
      } else {
        root.classList.add("dark");
      }
    }
  }, [theme, fontFamily]);

  return null;
}
