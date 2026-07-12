import { create } from "zustand";

interface MotionState {
  reduce: boolean;
  setReduce: (reduce: boolean) => void;
}

// In Next.js, this code runs on the server as well, so we must safely access window
const getInitialMotionState = () => {
  if (typeof window === "undefined") return false;
  
  // FR-A11Y-010: 1.3 The user-facing motion toggle SHALL be authoritative.
  // Check local storage first.
  const stored = window.localStorage.getItem("cs-motion-reduce");
  if (stored !== null) {
    return stored === "true";
  }

  // 1.1 Query matchMedia for the OS preference.
  if (window.matchMedia) {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  return false;
};

export const useMotionStore = create<MotionState>((set) => {
  const initialState = getInitialMotionState();

  if (typeof window !== "undefined" && window.matchMedia) {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    
    // 1.2 Respond to a live change of the preference without a reload
    const handler = (e: MediaQueryListEvent) => {
      // Only apply OS preference if the user hasn't explicitly overridden it
      if (window.localStorage.getItem("cs-motion-reduce") === null) {
        set({ reduce: e.matches });
      }
    };

    // Modern API for event listeners
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handler);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handler);
    }
  }

  return {
    reduce: initialState,
    setReduce: (reduce: boolean) => {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("cs-motion-reduce", String(reduce));
      }
      set({ reduce });
    },
  };
});

if (typeof window !== "undefined") {
  const updateHtmlAttr = (reduce: boolean) => {
    if (reduce) {
      document.documentElement.setAttribute("data-motion", "reduce");
    } else {
      document.documentElement.removeAttribute("data-motion");
    }
  };
  
  // Apply immediately on load
  updateHtmlAttr(useMotionStore.getState().reduce);
  
  // Subscribe to all future changes
  useMotionStore.subscribe((state) => {
    updateHtmlAttr(state.reduce);
  });
}
