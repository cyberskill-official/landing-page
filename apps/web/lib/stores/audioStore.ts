import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export const MUTE_PREF_KEY = 'cyberskill_mute_pref';
export type MutePreference = 'on' | 'off';

type AudioContextConstructor = new () => AudioContext;

export type AudioState = {
  audioContext: AudioContext | null;
  muted: boolean;
  hydrateMutePreference: () => void;
  initAudioContext: () => AudioContext | null;
  setMuted: (muted: boolean, opts?: { persist?: boolean; resume?: boolean }) => void;
  syncFromStorageValue: (value: string | null) => void;
};

export function mutedToMutePreference(muted: boolean): MutePreference {
  return muted ? 'on' : 'off';
}

export function mutePreferenceToMuted(value: string | null | undefined): boolean {
  return value === 'off' ? false : true;
}

function readStoredMuted() {
  if (typeof localStorage === 'undefined') return true;
  try {
    return mutePreferenceToMuted(localStorage.getItem(MUTE_PREF_KEY));
  } catch {
    return true;
  }
}

function writeStoredMuted(muted: boolean) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(MUTE_PREF_KEY, mutedToMutePreference(muted));
  } catch {
    // Preference persistence is best-effort; state remains valid in memory.
  }
}

function audioContextConstructor(): AudioContextConstructor | null {
  if (typeof window === 'undefined') return null;
  const maybeWindow = window as typeof window & { webkitAudioContext?: AudioContextConstructor };
  return window.AudioContext ?? maybeWindow.webkitAudioContext ?? null;
}

function resumeAudioContext(context: AudioContext | null) {
  if (!context || context.state === 'running') return;
  void context.resume().catch(() => {
    // Browsers may reject resume outside a trusted gesture; next toggle retries.
  });
}

export const useAudioStore = create<AudioState>()(
  devtools(
    (set, get): AudioState => ({
      audioContext: null,
      muted: true,
      hydrateMutePreference: () => set({ muted: readStoredMuted() }),
      initAudioContext: () => {
        const existing = get().audioContext;
        if (existing) return existing;

        const Ctor = audioContextConstructor();
        if (!Ctor) return null;

        try {
          const audioContext = new Ctor();
          set({ audioContext });
          return audioContext;
        } catch {
          return null;
        }
      },
      setMuted: (muted, opts = {}) => {
        const persist = opts.persist ?? true;
        const resume = opts.resume ?? true;
        if (persist) writeStoredMuted(muted);
        set({ muted });
        if (!muted && resume) resumeAudioContext(get().audioContext);
      },
      syncFromStorageValue: (value) => {
        set({ muted: mutePreferenceToMuted(value) });
      },
    }),
    { name: 'audio-store', enabled: process.env.NODE_ENV !== 'production' },
  ),
);
