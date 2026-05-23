import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppearanceStore {
  theme: string;
  fontFamily: string;
  setTheme: (theme: string) => void;
  setFontFamily: (fontFamily: string) => void;
  reset: () => void;
}

const DEFAULT_THEME = "dark";
const DEFAULT_FONT = "geist";

export const useAppearance = create<AppearanceStore>()(
  persist(
    set => ({
      theme: DEFAULT_THEME,
      fontFamily: DEFAULT_FONT,
      setTheme: (theme: string) => set({ theme }),
      setFontFamily: (fontFamily: string) => set({ fontFamily }),
      reset: () => set({ theme: DEFAULT_THEME, fontFamily: DEFAULT_FONT })
    }),
    {
      name: "appearance-storage"
    }
  )
);
