import { create } from "zustand";

// Shared state machine for the Genie. The chat widget drives it; the Phase-3
// 3D scene subscribes to `status` and cross-fades animation clips:
//   idle -> listening (user typing) -> thinking (request in flight)
//        -> speaking (streaming tokens) -> idle
export type GenieStatus = "idle" | "listening" | "thinking" | "speaking";

export type GenieMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type CapturedLead = {
  name: string;
  email: string;
  need: string;
  company?: string;
  budget_timeline?: string;
};

export type PendingWishKind = "default" | "teardown";

type GenieState = {
  open: boolean;
  status: GenieStatus;
  messages: GenieMessage[];
  // A wish typed in the hero (or teardown CTA), waiting for the chat panel to
  // seed its flow on open (FR-CHAR-026 / FR-CTA-019). Cleared once consumed.
  pendingWish: string | null;
  pendingWishKind: PendingWishKind;
  isLeadCaptured: boolean;
  capturedLead: CapturedLead | null;
  setOpen: (open: boolean) => void;
  setStatus: (status: GenieStatus) => void;
  addMessage: (message: GenieMessage) => void;
  appendToMessage: (id: string, chunk: string) => void;
  setPendingWish: (wish: string | null, kind?: PendingWishKind) => void;
  setLeadCaptured: (captured: boolean, leadData?: CapturedLead | null) => void;
  reset: () => void;
};

export const useGenieStore = create<GenieState>((set) => ({
  open: false,
  status: "idle",
  messages: [],
  pendingWish: null,
  pendingWishKind: "default",
  isLeadCaptured: false,
  capturedLead: null,
  setOpen: (open) => set({ open }),
  setStatus: (status) => set({ status }),
  addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),
  appendToMessage: (id, chunk) =>
    set((s) => ({
      messages: s.messages.map((m) => (m.id === id ? { ...m, content: m.content + chunk } : m)),
    })),
  setPendingWish: (pendingWish, kind = "default") =>
    set({ pendingWish, pendingWishKind: kind }),
  setLeadCaptured: (isLeadCaptured, capturedLead = null) => set({ isLeadCaptured, capturedLead }),
  reset: () =>
    set({
      status: "idle",
      messages: [],
      pendingWish: null,
      pendingWishKind: "default",
      isLeadCaptured: false,
      capturedLead: null,
    }),
}));
