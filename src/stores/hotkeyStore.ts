import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { HotkeyConfig } from '../types';

interface HotkeyState {
  hotkeys: HotkeyConfig[];
  recordingHotkey: string | null;

  setHotkey: (action: string, key: string, ctrl: boolean, shift: boolean, alt: boolean) => void;
  resetHotkeys: () => void;
  startRecording: (action: string) => void;
  stopRecording: () => void;
}

const DEFAULT_HOTKEYS: HotkeyConfig[] = [
  { action: 'toggle-overlay', key: 'X', ctrl: true, shift: true, alt: false },
  { action: 'next-preset', key: 'ArrowRight', ctrl: true, shift: true, alt: false },
  { action: 'prev-preset', key: 'ArrowLeft', ctrl: true, shift: true, alt: false },
  { action: 'increase-size', key: 'ArrowUp', ctrl: true, shift: true, alt: false },
  { action: 'decrease-size', key: 'ArrowDown', ctrl: true, shift: true, alt: false },
  { action: 'toggle-visibility', key: 'H', ctrl: true, shift: true, alt: false },
  { action: 'lock-overlay', key: 'L', ctrl: true, shift: true, alt: false },
  { action: 'open-app', key: 'O', ctrl: true, shift: true, alt: false },
];

export const useHotkeyStore = create<HotkeyState>()(
  persist(
    (set) => ({
      hotkeys: DEFAULT_HOTKEYS,
      recordingHotkey: null,

      setHotkey: (action, key, ctrl, shift, alt) =>
        set((state) => {
          const exists = state.hotkeys.findIndex((h) => h.action === action);
          const newHotkey: HotkeyConfig = { action, key, ctrl, shift, alt };

          if (exists >= 0) {
            const updated = [...state.hotkeys];
            updated[exists] = newHotkey;
            return { hotkeys: updated };
          }
          return { hotkeys: [...state.hotkeys, newHotkey] };
        }),

      resetHotkeys: () => set({ hotkeys: DEFAULT_HOTKEYS }),

      startRecording: (action) => set({ recordingHotkey: action }),

      stopRecording: () => set({ recordingHotkey: null }),
    }),
    {
      name: 'hotkey-store',
    }
  )
);
