import { create } from "zustand";
import type { WishKind } from "@/lib/genie/wishFlow";

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

/** Entry flow for CTAs → Lumi (alias WishKind). */
export type GenieFlowKind = WishKind;

type GenieState = {
  open: boolean;
  status: GenieStatus;
  messages: GenieMessage[];
  pendingWish: string | null;
  pendingWishKind: GenieFlowKind;
  isLeadCaptured: boolean;
  capturedLead: CapturedLead | null;
  setOpen: (open: boolean) => void;
  setStatus: (status: GenieStatus) => void;
  addMessage: (message: GenieMessage) => void;
  appendToMessage: (id: string, chunk: string) => void;
  setPendingWish: (wish: string | null, kind?: GenieFlowKind) => void;
  /** Open modal and optionally seed a lead flow. */
  openFlow: (kind?: GenieFlowKind, seed?: string | null) => void;
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
  openFlow: (kind = "default", seed = null) =>
    set({
      open: true,
      pendingWishKind: kind,
      pendingWish: seed,
    }),
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
