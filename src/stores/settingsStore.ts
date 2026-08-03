import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeMode } from '../types';

interface SettingsState {
  theme: ThemeMode;
  accentColor: string;
  uiScale: number;
  highContrast: boolean;
  startupWithWindows: boolean;
  minimizeToTray: boolean;
  showNotifications: boolean;
  autoSave: boolean;
  sidebarPosition: 'left' | 'right';
  backgroundImage: string | null;

  setTheme: (theme: ThemeMode) => void;
  setAccentColor: (color: string) => void;
  setUiScale: (scale: number) => void;
  setHighContrast: (enabled: boolean) => void;
  toggleStartup: () => void;
  toggleMinimizeToTray: () => void;
  toggleNotifications: () => void;
  toggleAutoSave: () => void;
  setSidebarPosition: (pos: 'left' | 'right') => void;
  setBackgroundImage: (img: string | null) => void;
}

const initialSettingsState = {
  theme: 'dark' as ThemeMode,
  accentColor: '#3b82f6',
  uiScale: 1,
  highContrast: false,
  startupWithWindows: false,
  minimizeToTray: true,
  showNotifications: true,
  autoSave: true,
  sidebarPosition: 'left' as const,
  backgroundImage: null as string | null,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...initialSettingsState,

      setTheme: (theme) => set({ theme }),

      setAccentColor: (color) => set({ accentColor: color }),

      setUiScale: (scale) => set({ uiScale: Math.max(0.5, Math.min(2, scale)) }),

      setHighContrast: (enabled) => set({ highContrast: enabled }),

      toggleStartup: () =>
        set((state) => ({ startupWithWindows: !state.startupWithWindows })),

      toggleMinimizeToTray: () =>
        set((state) => ({ minimizeToTray: !state.minimizeToTray })),

      toggleNotifications: () =>
        set((state) => ({ showNotifications: !state.showNotifications })),

      toggleAutoSave: () =>
        set((state) => ({ autoSave: !state.autoSave })),

      setSidebarPosition: (pos) => set({ sidebarPosition: pos }),

      setBackgroundImage: (img) => set({ backgroundImage: img }),
    }),
    {
      name: 'settings-store',
    }
  )
);
