import { contextBridge, ipcRenderer } from 'electron';

export interface ElectronAPI {
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
}

const electronAPI: ElectronAPI = {
  overlay: {
    show: () => ipcRenderer.send('overlay:show'),
    hide: () => ipcRenderer.send('overlay:hide'),
    move: (x: number, y: number) => ipcRenderer.send('overlay:move', x, y),
    resize: (width: number, height: number) =>
      ipcRenderer.send('overlay:resize', width, height),
    lock: () => ipcRenderer.send('overlay:lock'),
    unlock: () => ipcRenderer.send('overlay:unlock'),
    setOpacity: (opacity: number) => ipcRenderer.send('overlay:set-opacity', opacity),
    setAlwaysOnTop: (alwaysOnTop: boolean) =>
      ipcRenderer.send('overlay:always-on-top', alwaysOnTop),
    send: (channel: string, ...args: unknown[]) =>
      ipcRenderer.send(channel, ...args),
  },
  crosshair: {
    set: (config: Record<string, unknown>) =>
      ipcRenderer.send('crosshair:set', config),
    request: () =>
      ipcRenderer.send('crosshair:request'),
    onUpdate: (callback: (config: Record<string, unknown>) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, config: Record<string, unknown>) =>
        callback(config);
      ipcRenderer.on('crosshair:update', handler);
      return () => {
        ipcRenderer.removeListener('crosshair:update', handler);
      };
    },
  },
  app: {
    quit: () => ipcRenderer.send('app:quit'),
    minimize: () => ipcRenderer.send('app:minimize'),
    maximize: () => ipcRenderer.send('app:maximize'),
    toggleDevtools: () => ipcRenderer.send('app:toggle-devtools'),
    setStartup: (enabled: boolean) => ipcRenderer.send('app:set-startup', enabled),
    getVersion: () => {
      return ipcRenderer.sendSync('app:get-version') as string;
    },
  },
  settings: {
    get: (key: string) => ipcRenderer.invoke('settings:get', key),
    set: (key: string, value: unknown) =>
      ipcRenderer.invoke('settings:set', key, value),
    getAll: () => ipcRenderer.invoke('settings:get-all'),
    onDidChange: (
      key: string,
      callback: (newValue: unknown, oldValue: unknown) => void
    ) => {
      const channel = `settings:changed:${key}`;
      const handler = (
        _event: Electron.IpcRendererEvent,
        newValue: unknown,
        oldValue: unknown
      ) => callback(newValue, oldValue);
      ipcRenderer.on(channel, handler);
      return () => {
        ipcRenderer.removeListener(channel, handler);
      };
    },
  },
  tray: {
    setup: () => ipcRenderer.send('tray:setup'),
  },
  update: {
    install: () => ipcRenderer.send('update:install'),
    check: () => ipcRenderer.send('update:check'),
    onStatus: (callback) => {
      const handler = (_event: Electron.IpcRendererEvent, info: { state: string; version?: string; releaseDate?: string; message?: string }) =>
        callback(info);
      ipcRenderer.on('update:status', handler);
      return () => { ipcRenderer.removeListener('update:status', handler); };
    },
    onProgress: (callback) => {
      const handler = (_event: Electron.IpcRendererEvent, progress: { percent: number; bytesPerSecond: number; transferred: number; total: number }) =>
        callback(progress);
      ipcRenderer.on('update:progress', handler);
      return () => { ipcRenderer.removeListener('update:progress', handler); };
    },
  },
  onCrosshairUpdate: (callback: (config: Record<string, unknown>) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, config: Record<string, unknown>) =>
      callback(config);
    ipcRenderer.on('crosshair:update', handler);
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
