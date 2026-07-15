import { create } from "zustand";

interface MotionState {
  reduce: boolean;
  setReduce: (reduce: boolean) => void;
}

// The store always starts as `reduce: false` - on the server AND on the
// client's very first (hydration) render. The server can never know the
// browser's media query or a localStorage override, so if the client's first
// render resolved the *real* value instead, any component that reads `reduce`
// directly in its render body (not just inside a useEffect - see
// components/motion/DepthField.tsx) would render different output than the
// server-rendered HTML. React then can't reconcile the two: it discards and
// re-renders the mismatched subtree from scratch, which is exactly the
// "didn't match" console errors this file used to cause (and, as a knock-on
// effect of that tree-discard racing with other scroll-driven DOM writes,
// unrelated-looking errors elsewhere in the tree too).
//
// The real value is applied by `syncMotionPreference()` below, which must only
// ever be invoked from a useEffect (see components/a11y/MotionPreferenceSync.tsx)
// so it runs strictly after hydration has already committed.
export const useMotionStore = create<MotionState>((set) => ({
  reduce: false,
  setReduce: (reduce) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("cs-motion-reduce", String(reduce));
    }
    set({ reduce });
  },
}));

function resolvePreference(): boolean {
  // TASK-A11Y-010: 1.3 The user-facing motion toggle SHALL be authoritative.
  const stored = window.localStorage.getItem("cs-motion-reduce");
  if (stored !== null) return stored === "true";

  // 1.1 Fall back to the OS preference.
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

function updateHtmlAttr(reduce: boolean) {
  if (reduce) {
    document.documentElement.setAttribute("data-motion", "reduce");
  } else {
    document.documentElement.removeAttribute("data-motion");
  }
}

let synced = false;

// Resolve the real motion preference, mirror it onto <html data-motion>, and
// wire the live matchMedia change listener (TASK-A11Y-010: 1.2). Idempotent and
// safe to call from multiple mounts - only the first call after a page load
// does anything. Must be called post-mount (useEffect), never at module scope.
export function syncMotionPreference() {
  if (synced || typeof window === "undefined") return;
  synced = true;

  const apply = (reduce: boolean) => {
    useMotionStore.setState({ reduce });
    updateHtmlAttr(reduce);
  };

  apply(resolvePreference());

  const mediaQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  if (!mediaQuery) return;

  const handler = (e: MediaQueryListEvent) => {
    // Only follow the OS preference live if the user hasn't explicitly
    // overridden it via the manual toggle.
    if (window.localStorage.getItem("cs-motion-reduce") === null) {
      apply(e.matches);
    }
  };

  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener("change", handler);
  } else {
    // Fallback for older browsers.
    mediaQuery.addListener(handler);
  }
}
