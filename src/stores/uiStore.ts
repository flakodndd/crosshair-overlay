import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ActiveView = 'library' | 'creator' | 'presets' | 'profiles' | 'settings' | 'about' | 'background';
type PreviewBackground = 'dark' | 'light' | 'custom' | 'game';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: number;
}

interface UIState {
  sidebarCollapsed: boolean;
  activeView: ActiveView;
  showPreview: boolean;
  previewBackground: PreviewBackground;
  previewZoom: number;
  showTutorial: boolean;
  showNotifications: boolean;
  notifications: Notification[];

  toggleSidebar: () => void;
  setActiveView: (view: ActiveView) => void;
  togglePreview: () => void;
  setPreviewBackground: (background: PreviewBackground) => void;
  setPreviewZoom: (zoom: number) => void;
  setShowTutorial: (show: boolean) => void;
  addNotification: (type: Notification['type'], title: string, message: string) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

const initialUIState = {
  sidebarCollapsed: false,
  activeView: 'library' as ActiveView,
  showPreview: true,
  previewBackground: 'dark' as PreviewBackground,
  previewZoom: 1,
  showTutorial: false,
  showNotifications: false,
  notifications: [] as Notification[],
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      ...initialUIState,

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setActiveView: (view) => set({ activeView: view }),

      togglePreview: () =>
        set((state) => ({ showPreview: !state.showPreview })),

      setPreviewBackground: (background) => set({ previewBackground: background }),

      setPreviewZoom: (zoom) =>
        set({ previewZoom: Math.max(0.25, Math.min(3, zoom)) }),

      setShowTutorial: (show) => set({ showTutorial: show }),

      addNotification: (type, title, message) =>
        set((state) => {
          const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
          const notification: Notification = {
            id,
            type,
            title,
            message,
            timestamp: Date.now(),
          };
          return {
            notifications: [notification, ...state.notifications].slice(0, 50),
            showNotifications: true,
          };
        }),

      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'ui-store',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        activeView: state.activeView,
        showPreview: state.showPreview,
        previewBackground: state.previewBackground,
        previewZoom: state.previewZoom,
        showTutorial: state.showTutorial,
      }),
    }
  )
);
