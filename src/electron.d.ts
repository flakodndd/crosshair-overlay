export {};

declare global {
  interface Window {
    electronAPI?: {
      overlay: {
        show: () => void;
        hide: () => void;
        move: (x: number, y: number) => void;
        resize: (width: number, height: number) => void;
        lock: () => void;
        unlock: () => void;
        setOpacity: (opacity: number) => void;
        setAlwaysOnTop: (alwaysOnTop: boolean) => void;
        send: (channel: string, ...args: unknown[]) => void;
      };
      crosshair: {
        set: (config: Record<string, unknown>) => void;
        request: () => void;
        onUpdate: (callback: (config: Record<string, unknown>) => void) => void;
      };
      app: {
        quit: () => void;
        minimize: () => void;
        maximize: () => void;
        toggleDevtools: () => void;
        setStartup: (enabled: boolean) => void;
        getVersion: () => string;
      };
      settings: {
        get: (key: string) => Promise<unknown>;
        set: (key: string, value: unknown) => Promise<void>;
        getAll: () => Promise<Record<string, unknown>>;
        onDidChange: (
          key: string,
          callback: (newValue: unknown, oldValue: unknown) => void
        ) => () => void;
      };
      tray: {
        setup: () => void;
      };
      update: {
        install: () => void;
        check: () => void;
        onStatus: (callback: (info: { state: string; version?: string; releaseDate?: string; message?: string }) => void) => () => void;
        onProgress: (callback: (progress: { percent: number; bytesPerSecond: number; transferred: number; total: number }) => void) => () => void;
      };
      onCrosshairUpdate: (callback: (config: Record<string, unknown>) => void) => void;
      removeCrosshairListener?: (callback: (config: Record<string, unknown>) => void) => void;
    };
  }
}
