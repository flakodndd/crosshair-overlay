import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OverlayState {
  visible: boolean;
  locked: boolean;
  position: { x: number; y: number };
  size: { w: number; h: number };
  opacity: number;
  alwaysOnTop: boolean;
  multiMonitor: boolean;
  selectedMonitor: number;

  toggleVisible: () => void;
  toggleLock: () => void;
  setPosition: (x: number, y: number) => void;
  setSize: (w: number, h: number) => void;
  setOpacity: (opacity: number) => void;
  setAlwaysOnTop: (enabled: boolean) => void;
  setMultiMonitor: (enabled: boolean) => void;
  setSelectedMonitor: (monitor: number) => void;
  centerOverlay: () => void;
  resetOverlay: () => void;
}

const initialOverlayState = {
  visible: true,
  locked: false,
  position: { x: 0, y: 0 },
  size: { w: 40, h: 40 },
  opacity: 1,
  alwaysOnTop: true,
  multiMonitor: false,
  selectedMonitor: 0,
};

export const useOverlayStore = create<OverlayState>()(
  persist(
    (set) => ({
      ...initialOverlayState,

      toggleVisible: () =>
        set((state) => ({ visible: !state.visible })),

      toggleLock: () =>
        set((state) => ({ locked: !state.locked })),

      setPosition: (x, y) =>
        set({ position: { x, y } }),

      setSize: (w, h) =>
        set({
          size: {
            w: Math.max(10, Math.min(200, w)),
            h: Math.max(10, Math.min(200, h)),
          },
        }),

      setOpacity: (opacity) =>
        set({ opacity: Math.max(0, Math.min(1, opacity)) }),

      setAlwaysOnTop: (enabled) => set({ alwaysOnTop: enabled }),

      setMultiMonitor: (enabled) => set({ multiMonitor: enabled }),

      setSelectedMonitor: (monitor) => set({ selectedMonitor: monitor }),

      centerOverlay: () =>
        set({
          position: {
            x: Math.round(window.screen.width / 2),
            y: Math.round(window.screen.height / 2),
          },
        }),

      resetOverlay: () => set(initialOverlayState),
    }),
    {
      name: 'overlay-store',
    }
  )
);
