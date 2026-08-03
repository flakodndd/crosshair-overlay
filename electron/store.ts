import Store from 'electron-store';

export interface OverlaySettings {
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  locked: boolean;
  alwaysOnTop: boolean;
  visible: boolean;
}

export interface CrosshairSettings {
  type: 'dot' | 'cross' | 'circle' | 'custom';
  color: string;
  size: number;
  thickness: number;
  gap: number;
  outline: boolean;
  outlineColor: string;
  outlineWidth: number;
  presets: CrosshairPreset[];
  activePresetIndex: number;
}

export interface CrosshairPreset {
  id: string;
  name: string;
  crosshair: Omit<CrosshairSettings, 'presets' | 'activePresetIndex'>;
}

export interface HotkeySettings {
  toggleOverlay: string;
  nextPreset: string;
  prevPreset: string;
  increaseSize: string;
  decreaseSize: string;
  toggleVisibility: string;
  lockOverlay: string;
  openApp: string;
}

export interface AppSettings {
  overlay: OverlaySettings;
  crosshair: CrosshairSettings;
  hotkeys: HotkeySettings;
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  launchAtStartup: boolean;
  minimizeToTray: boolean;
}

const defaultSettings: AppSettings = {
  overlay: {
    x: 100,
    y: 100,
    width: 200,
    height: 200,
    opacity: 1.0,
    locked: false,
    alwaysOnTop: true,
    visible: true,
  },
  crosshair: {
    type: 'cross',
    color: '#00ff00',
    size: 20,
    thickness: 2,
    gap: 4,
    outline: false,
    outlineColor: '#000000',
    outlineWidth: 1,
    presets: [
      {
        id: 'default-cross',
        name: 'Default Cross',
        crosshair: {
          type: 'cross',
          color: '#00ff00',
          size: 20,
          thickness: 2,
          gap: 4,
          outline: false,
          outlineColor: '#000000',
          outlineWidth: 1,
        },
      },
      {
        id: 'default-dot',
        name: 'Default Dot',
        crosshair: {
          type: 'dot',
          color: '#ff0000',
          size: 6,
          thickness: 1,
          gap: 0,
          outline: false,
          outlineColor: '#000000',
          outlineWidth: 1,
        },
      },
    ],
    activePresetIndex: 0,
  },
  hotkeys: {
    toggleOverlay: 'Ctrl+Shift+X',
    nextPreset: 'Ctrl+Shift+Right',
    prevPreset: 'Ctrl+Shift+Left',
    increaseSize: 'Ctrl+Shift+Up',
    decreaseSize: 'Ctrl+Shift+Down',
    toggleVisibility: 'Ctrl+Shift+H',
    lockOverlay: 'Ctrl+Shift+L',
    openApp: 'Ctrl+Shift+O',
  },
  theme: 'dark',
  accentColor: '#6366f1',
  launchAtStartup: false,
  minimizeToTray: true,
};

class SettingsStore {
  private store: Store<AppSettings>;

  constructor() {
    this.store = new Store<AppSettings>({
      name: 'settings',
      defaults: defaultSettings,
      schema: {
        overlay: {
          type: 'object',
          properties: {
            x: { type: 'number' },
            y: { type: 'number' },
            width: { type: 'number', minimum: 50, maximum: 800 },
            height: { type: 'number', minimum: 50, maximum: 800 },
            opacity: { type: 'number', minimum: 0.1, maximum: 1.0 },
            locked: { type: 'boolean' },
            alwaysOnTop: { type: 'boolean' },
            visible: { type: 'boolean' },
          },
        },
        crosshair: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['dot', 'cross', 'circle', 'custom'] },
            color: { type: 'string' },
            size: { type: 'number', minimum: 1, maximum: 100 },
            thickness: { type: 'number', minimum: 1, maximum: 10 },
            gap: { type: 'number', minimum: 0, maximum: 50 },
            outline: { type: 'boolean' },
            outlineColor: { type: 'string' },
            outlineWidth: { type: 'number', minimum: 1, maximum: 5 },
            presets: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  crosshair: { type: 'object' },
                },
              },
            },
            activePresetIndex: { type: 'number', minimum: 0 },
          },
        },
        hotkeys: {
          type: 'object',
          properties: {
            toggleOverlay: { type: 'string' },
            nextPreset: { type: 'string' },
            prevPreset: { type: 'string' },
            increaseSize: { type: 'string' },
            decreaseSize: { type: 'string' },
            toggleVisibility: { type: 'string' },
            lockOverlay: { type: 'string' },
            openApp: { type: 'string' },
          },
        },
        theme: { type: 'string', enum: ['light', 'dark', 'system'] },
        accentColor: { type: 'string' },
        launchAtStartup: { type: 'boolean' },
        minimizeToTray: { type: 'boolean' },
      },
    });
  }

  get<K extends keyof AppSettings>(key: K): AppSettings[K] {
    return this.store.get(key);
  }

  set<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void {
    this.store.set(key, value);
  }

  getAll(): AppSettings {
    return this.store.store;
  }

  reset(): void {
    this.store.clear();
  }

  onDidChange<K extends keyof AppSettings>(
    key: K,
    callback: (newValue: AppSettings[K] | undefined, oldValue: AppSettings[K] | undefined) => void
  ): () => void {
    return this.store.onDidChange(key, callback as any);
  }
}

let settingsInstance: SettingsStore | null = null;

export function getSettings(): SettingsStore {
  if (!settingsInstance) {
    settingsInstance = new SettingsStore();
  }
  return settingsInstance;
}

export type { AppSettings as Settings };
export { defaultSettings };
