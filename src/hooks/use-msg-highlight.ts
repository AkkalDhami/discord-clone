import { create } from "zustand";

type State = {
  highlightedId: string | null;
  highlight: (id: string) => void;
};

export const useMessageHighlight = create<State>(set => ({
  highlightedId: null,

  highlight: id => {
    set({ highlightedId: id });

    setTimeout(() => {
      set({ highlightedId: null });
    }, 3200);
  }
}));
