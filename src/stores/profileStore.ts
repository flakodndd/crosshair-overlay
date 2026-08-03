import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { GameProfile } from '../types';

interface ProfileState {
  profiles: GameProfile[];
  activeProfileId: string | null;

  createProfile: (name: string, icon: string) => string;
  deleteProfile: (id: string) => void;
  renameProfile: (id: string, name: string) => void;
  setActiveProfile: (id: string | null) => void;
  updateProfileSettings: (id: string, updates: Partial<GameProfile>) => void;
  duplicateProfile: (id: string) => void;
}

const DEFAULT_PROFILES: GameProfile[] = [
  {
    id: 'profile-cs2',
    name: 'Counter-Strike 2',
    icon: '🎯',
    crosshairPresetId: 'default-classic',
    size: 1,
    position: { x: 0, y: 0 },
    opacity: 1,
    overlayOpacity: 1,
    overlaySettings: {
      visible: true,
      locked: false,
      position: { x: 960, y: 540 },
      size: { w: 40, h: 40 },
      opacity: 1,
      alwaysOnTop: true,
      multiMonitor: false,
    },
  },
  {
    id: 'profile-valorant',
    name: 'Valorant',
    icon: '🔫',
    crosshairPresetId: 'default-classic',
    size: 0.8,
    position: { x: 0, y: 0 },
    opacity: 1,
    overlayOpacity: 1,
    overlaySettings: {
      visible: true,
      locked: false,
      position: { x: 960, y: 540 },
      size: { w: 32, h: 32 },
      opacity: 1,
      alwaysOnTop: true,
      multiMonitor: false,
    },
  },
  {
    id: 'profile-r6',
    name: 'Rainbow Six Siege',
    icon: '🌈',
    crosshairPresetId: 'default-classic',
    size: 1,
    position: { x: 0, y: 0 },
    opacity: 1,
    overlayOpacity: 1,
    overlaySettings: {
      visible: true,
      locked: false,
      position: { x: 960, y: 540 },
      size: { w: 40, h: 40 },
      opacity: 1,
      alwaysOnTop: true,
      multiMonitor: false,
    },
  },
  {
    id: 'profile-bloodstrike',
    name: 'Blood Strike',
    icon: '🩸',
    crosshairPresetId: 'default-sniper',
    size: 1.2,
    position: { x: 0, y: 0 },
    opacity: 1,
    overlayOpacity: 1,
    overlaySettings: {
      visible: true,
      locked: false,
      position: { x: 960, y: 540 },
      size: { w: 48, h: 48 },
      opacity: 1,
      alwaysOnTop: true,
      multiMonitor: false,
    },
  },
  {
    id: 'profile-fortnite',
    name: 'Fortnite',
    icon: '🏗️',
    crosshairPresetId: 'default-minimal',
    size: 0.9,
    position: { x: 0, y: 0 },
    opacity: 1,
    overlayOpacity: 1,
    overlaySettings: {
      visible: true,
      locked: false,
      position: { x: 960, y: 540 },
      size: { w: 36, h: 36 },
      opacity: 1,
      alwaysOnTop: true,
      multiMonitor: false,
    },
  },
  {
    id: 'profile-apex',
    name: 'Apex Legends',
    icon: '🏆',
    crosshairPresetId: 'default-classic',
    size: 1,
    position: { x: 0, y: 0 },
    opacity: 1,
    overlayOpacity: 1,
    overlaySettings: {
      visible: true,
      locked: false,
      position: { x: 960, y: 540 },
      size: { w: 40, h: 40 },
      opacity: 1,
      alwaysOnTop: true,
      multiMonitor: false,
    },
  },
  {
    id: 'profile-pubg',
    name: 'PUBG',
    icon: '🪖',
    crosshairPresetId: 'default-sniper',
    size: 1.1,
    position: { x: 0, y: 0 },
    opacity: 1,
    overlayOpacity: 1,
    overlaySettings: {
      visible: true,
      locked: false,
      position: { x: 960, y: 540 },
      size: { w: 44, h: 44 },
      opacity: 1,
      alwaysOnTop: true,
      multiMonitor: false,
    },
  },
];

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profiles: DEFAULT_PROFILES,
      activeProfileId: null,

      createProfile: (name, icon) => {
        const id = uuidv4();
        const profile: GameProfile = {
          id,
          name,
          icon,
          crosshairPresetId: '',
          size: 1,
          position: { x: 0, y: 0 },
          opacity: 1,
          overlayOpacity: 1,
          overlaySettings: {
            visible: true,
            locked: false,
            position: { x: 960, y: 540 },
            size: { w: 40, h: 40 },
            opacity: 1,
            alwaysOnTop: true,
            multiMonitor: false,
          },
        };
        set((state) => ({
          profiles: [...state.profiles, profile],
        }));
        return id;
      },

      deleteProfile: (id) =>
        set((state) => ({
          profiles: state.profiles.filter((p) => p.id !== id),
          activeProfileId: state.activeProfileId === id ? null : state.activeProfileId,
        })),

      renameProfile: (id, name) =>
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === id ? { ...p, name } : p
          ),
        })),

      setActiveProfile: (id) => set({ activeProfileId: id }),

      updateProfileSettings: (id, updates) =>
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),

      duplicateProfile: (id) => {
        const state = get();
        const original = state.profiles.find((p) => p.id === id);
        if (!original) return;

        const newId = uuidv4();
        const duplicate: GameProfile = {
          ...original,
          id: newId,
          name: `${original.name} (Copy)`,
        };
        set((state) => ({
          profiles: [...state.profiles, duplicate],
        }));
      },
    }),
    {
      name: 'profile-store',
    }
  )
);
