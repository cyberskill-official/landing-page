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

type GenieState = {
  open: boolean;
  status: GenieStatus;
  messages: GenieMessage[];
  setOpen: (open: boolean) => void;
  setStatus: (status: GenieStatus) => void;
  addMessage: (message: GenieMessage) => void;
  appendToMessage: (id: string, chunk: string) => void;
  reset: () => void;
};

export const useGenieStore = create<GenieState>((set) => ({
  open: false,
  status: "idle",
  messages: [],
  setOpen: (open) => set({ open }),
  setStatus: (status) => set({ status }),
  addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),
  appendToMessage: (id, chunk) =>
    set((s) => ({
      messages: s.messages.map((m) => (m.id === id ? { ...m, content: m.content + chunk } : m)),
    })),
  reset: () => set({ status: "idle", messages: [] }),
}));
