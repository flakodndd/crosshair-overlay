import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { CrosshairPreset, CrosshairConfig, ExportPreset } from '../types';
import { BUILTIN_CROSSHAIRS } from '../data/crosshairs';

interface PresetState {
  presets: CrosshairPreset[];
  activePresetId: string | null;
  folders: string[];
  recentPresets: string[];

  createPreset: (name: string, crosshair: CrosshairConfig, folder?: string) => string;
  deletePreset: (id: string) => void;
  renamePreset: (id: string, name: string) => void;
  duplicatePreset: (id: string) => void;
  setActivePreset: (id: string | null) => void;
  createFolder: (folderName: string) => void;
  moveToFolder: (presetId: string, folder: string) => void;
  exportPreset: (id: string) => string | null;
  importPreset: (jsonString: string) => boolean;
  reorderPresets: (fromIndex: number, toIndex: number) => void;
  toggleFavoritePreset: (id: string) => void;
}

const DEFAULT_PRESETS: CrosshairPreset[] = [
  {
    id: 'default-classic',
    name: 'Classic Green',
    crosshair: BUILTIN_CROSSHAIRS[1],
    size: 1,
    position: { x: 0, y: 0 },
    opacity: 1,
    overlayOpacity: 1,
    locked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    favorite: true,
    folder: 'Default',
  },
  {
    id: 'default-sniper',
    name: 'Sniper Scope',
    crosshair: BUILTIN_CROSSHAIRS[8],
    size: 1.2,
    position: { x: 0, y: 0 },
    opacity: 1,
    overlayOpacity: 1,
    locked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    favorite: false,
    folder: 'Default',
  },
  {
    id: 'default-minimal',
    name: 'Minimal Dot',
    crosshair: BUILTIN_CROSSHAIRS[6],
    size: 1,
    position: { x: 0, y: 0 },
    opacity: 0.8,
    overlayOpacity: 1,
    locked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    favorite: false,
    folder: 'Default',
  },
];

export const usePresetStore = create<PresetState>()(
  persist(
    (set, get) => ({
      presets: DEFAULT_PRESETS,
      activePresetId: null,
      folders: ['Default', 'FPS Games', 'Battle Royale'],
      recentPresets: [],

      createPreset: (name, crosshair, folder = 'Default') => {
        const id = uuidv4();
        const now = new Date().toISOString();
        const preset: CrosshairPreset = {
          id,
          name,
          crosshair,
          size: 1,
          position: { x: 0, y: 0 },
          opacity: 1,
          overlayOpacity: 1,
          locked: false,
          createdAt: now,
          updatedAt: now,
          favorite: false,
          folder,
        };
        set((state) => ({
          presets: [...state.presets, preset],
        }));
        return id;
      },

      deletePreset: (id) =>
        set((state) => ({
          presets: state.presets.filter((p) => p.id !== id),
          activePresetId: state.activePresetId === id ? null : state.activePresetId,
          recentPresets: state.recentPresets.filter((r) => r !== id),
        })),

      renamePreset: (id, name) =>
        set((state) => ({
          presets: state.presets.map((p) =>
            p.id === id ? { ...p, name, updatedAt: new Date().toISOString() } : p
          ),
        })),

      duplicatePreset: (id) => {
        const state = get();
        const original = state.presets.find((p) => p.id === id);
        if (!original) return;

        const newId = uuidv4();
        const now = new Date().toISOString();
        const duplicate: CrosshairPreset = {
          ...original,
          id: newId,
          name: `${original.name} (Copy)`,
          createdAt: now,
          updatedAt: now,
          favorite: false,
        };
        set((state) => ({
          presets: [...state.presets, duplicate],
        }));
      },

      setActivePreset: (id) => set({ activePresetId: id }),

      createFolder: (folderName) =>
        set((state) => {
          if (state.folders.includes(folderName)) return state;
          return { folders: [...state.folders, folderName] };
        }),

      moveToFolder: (presetId, folder) =>
        set((state) => ({
          presets: state.presets.map((p) =>
            p.id === presetId ? { ...p, folder, updatedAt: new Date().toISOString() } : p
          ),
        })),

      exportPreset: (id) => {
        const state = get();
        const preset = state.presets.find((p) => p.id === id);
        if (!preset) return null;

        const exportData: ExportPreset = {
          version: '1.0.0',
          preset,
          createdAt: new Date().toISOString(),
        };
        return JSON.stringify(exportData, null, 2);
      },

      importPreset: (jsonString) => {
        try {
          const data = JSON.parse(jsonString) as ExportPreset;
          if (!data.preset || !data.preset.crosshair) return false;

          const newId = uuidv4();
          const now = new Date().toISOString();
          const imported: CrosshairPreset = {
            ...data.preset,
            id: newId,
            name: `${data.preset.name} (Imported)`,
            createdAt: now,
            updatedAt: now,
            favorite: false,
          };

          set((state) => ({
            presets: [...state.presets, imported],
          }));
          return true;
        } catch {
          return false;
        }
      },

      reorderPresets: (fromIndex, toIndex) =>
        set((state) => {
          const presets = [...state.presets];
          const [moved] = presets.splice(fromIndex, 1);
          presets.splice(toIndex, 0, moved);
          return { presets };
        }),

      toggleFavoritePreset: (id) =>
        set((state) => ({
          presets: state.presets.map((p) =>
            p.id === id ? { ...p, favorite: !p.favorite, updatedAt: new Date().toISOString() } : p
          ),
        })),
    }),
    {
      name: 'preset-store',
    }
  )
);
