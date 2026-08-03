import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CrosshairConfig, Category } from '../types';
import { BUILTIN_CROSSHAIRS } from '../data/crosshairs';

interface CrosshairState {
  activeCrosshair: CrosshairConfig | null;
  crosshairSize: number;
  crosshairColor: string;
  crosshairOpacity: number;
  customCrosshairs: CrosshairConfig[];
  favorites: string[];
  recentCrosshairs: string[];
  searchQuery: string;
  selectedCategory: Category | 'all';
  editingCrosshair: CrosshairConfig | null;

  setActiveCrosshair: (crosshair: CrosshairConfig | null) => void;
  setCrosshairSize: (size: number) => void;
  setCrosshairColor: (color: string) => void;
  setCrosshairOpacity: (opacity: number) => void;
  addCustomCrosshair: (crosshair: CrosshairConfig) => void;
  removeCustomCrosshair: (id: string) => void;
  updateCustomCrosshair: (id: string, updates: Partial<CrosshairConfig>) => void;
  toggleFavorite: (id: string) => void;
  addToRecent: (id: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: Category | 'all') => void;
  setEditingCrosshair: (crosshair: CrosshairConfig | null) => void;
  resetCrosshair: () => void;

  getAllCrosshairs: () => CrosshairConfig[];
  getFilteredCrosshairs: () => CrosshairConfig[];
  getFavoriteCrosshairs: () => CrosshairConfig[];
}

const MAX_RECENT = 20;

const initialCrosshairState = {
  activeCrosshair: null,
  crosshairSize: 1,
  crosshairColor: '#ffffff',
  crosshairOpacity: 1,
  customCrosshairs: [],
  favorites: [],
  recentCrosshairs: [],
  searchQuery: '',
  selectedCategory: 'all' as Category | 'all',
  editingCrosshair: null,
};

export const useCrosshairStore = create<CrosshairState>()(
  persist(
    (set, get) => ({
      ...initialCrosshairState,

      setActiveCrosshair: (crosshair) => set({ activeCrosshair: crosshair, editingCrosshair: null }),

      setCrosshairSize: (size) => set({ crosshairSize: Math.max(0.1, Math.min(5, size)) }),

      setCrosshairColor: (color) => set({ crosshairColor: color }),

      setCrosshairOpacity: (opacity) => set({ crosshairOpacity: Math.max(0, Math.min(1, opacity)) }),

      addCustomCrosshair: (crosshair) =>
        set((state) => ({
          customCrosshairs: [...state.customCrosshairs, crosshair],
        })),

      removeCustomCrosshair: (id) =>
        set((state) => ({
          customCrosshairs: state.customCrosshairs.filter((c) => c.id !== id),
          favorites: state.favorites.filter((f) => f !== id),
          recentCrosshairs: state.recentCrosshairs.filter((r) => r !== id),
          activeCrosshair: state.activeCrosshair?.id === id ? null : state.activeCrosshair,
        })),

      updateCustomCrosshair: (id, updates) =>
        set((state) => ({
          customCrosshairs: state.customCrosshairs.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
          activeCrosshair:
            state.activeCrosshair?.id === id
              ? { ...state.activeCrosshair, ...updates }
              : state.activeCrosshair,
        })),

      toggleFavorite: (id) =>
        set((state) => {
          const isFavorited = state.favorites.includes(id);
          return {
            favorites: isFavorited
              ? state.favorites.filter((f) => f !== id)
              : [...state.favorites, id],
          };
        }),

      addToRecent: (id) =>
        set((state) => {
          const filtered = state.recentCrosshairs.filter((r) => r !== id);
          return {
            recentCrosshairs: [id, ...filtered].slice(0, MAX_RECENT),
          };
        }),

      setSearchQuery: (query) => set({ searchQuery: query }),

      setSelectedCategory: (category) => set({ selectedCategory: category }),

      setEditingCrosshair: (crosshair) => set({ editingCrosshair: crosshair }),

      resetCrosshair: () => set(initialCrosshairState),

      getAllCrosshairs: () => {
        const state = get();
        return [...BUILTIN_CROSSHAIRS, ...state.customCrosshairs];
      },

      getFilteredCrosshairs: () => {
        const state = get();
        const all = [...BUILTIN_CROSSHAIRS, ...state.customCrosshairs];
        let filtered = all;

        if (state.selectedCategory !== 'all') {
          filtered = filtered.filter((c) => c.category === state.selectedCategory);
        }

        if (state.searchQuery.trim()) {
          const q = state.searchQuery.toLowerCase();
          filtered = filtered.filter(
            (c) =>
              c.name.toLowerCase().includes(q) ||
              c.category.toLowerCase().includes(q)
          );
        }

        return filtered;
      },

      getFavoriteCrosshairs: () => {
        const state = get();
        const all = [...BUILTIN_CROSSHAIRS, ...state.customCrosshairs];
        return all.filter((c) => state.favorites.includes(c.id));
      },
    }),
    {
      name: 'crosshair-store',
      partialize: (state) => ({
        activeCrosshair: state.activeCrosshair,
        crosshairSize: state.crosshairSize,
        crosshairColor: state.crosshairColor,
        crosshairOpacity: state.crosshairOpacity,
        customCrosshairs: state.customCrosshairs,
        favorites: state.favorites,
        recentCrosshairs: state.recentCrosshairs,
        searchQuery: state.searchQuery,
        selectedCategory: state.selectedCategory,
      }),
    }
  )
);
