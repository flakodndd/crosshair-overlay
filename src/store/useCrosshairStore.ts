import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { CrosshairConfig } from '../types';

interface CrosshairState {
  crosshairs: CrosshairConfig[];
  selectedId: string | null;
  recentIds: string[];
  favoriteIds: string[];
  activeView: string;

  // Actions
  setSelected: (id: string | null) => void;
  addCrosshair: (config: Omit<CrosshairConfig, 'id'>) => string;
  updateCrosshair: (id: string, updates: Partial<CrosshairConfig>) => void;
  deleteCrosshair: (id: string) => void;
  duplicateCrosshair: (id: string) => string | null;
  toggleFavorite: (id: string) => void;
  addToRecent: (id: string) => void;
  setActiveView: (view: string) => void;
  getSelected: () => CrosshairConfig | null;
}

const defaultCrosshairs: CrosshairConfig[] = [
  {
    id: 'default-1',
    name: 'Classic Cross',
    category: 'classic',
    width: 6,
    height: 6,
    thickness: 2,
    gap: 4,
    opacity: 1,
    color: '#00ff00',
    hex: '#00ff00',
    glow: false,
    glowIntensity: 3,
    outline: false,
    outlineThickness: 1,
    rotation: 0,
    shadow: false,
    shadowBlur: 4,
    roundedEdges: false,
    horizontalWidth: 6,
    horizontalHeight: 6,
    verticalWidth: 6,
    verticalHeight: 6,
    centerDot: false,
    centerDotSize: 4,
    centerDotColor: '#00ff00',
    circle: false,
    circleRadius: 10,
    circleThickness: 2,
    circleColor: '#00ff00',
    offset: 0,
    transparency: 1,
    animation: 'none',
    animationSpeed: 1,
    gradient: false,
    gradientColors: ['#00ff00', '#00ffff'],
    rainbowMode: false,
  },
  {
    id: 'default-2',
    name: 'Red Dot',
    category: 'dot',
    width: 0,
    height: 0,
    thickness: 2,
    gap: 4,
    opacity: 1,
    color: '#ff0000',
    hex: '#ff0000',
    glow: true,
    glowIntensity: 2,
    outline: false,
    outlineThickness: 1,
    rotation: 0,
    shadow: false,
    shadowBlur: 4,
    roundedEdges: true,
    horizontalWidth: 0,
    horizontalHeight: 0,
    verticalWidth: 0,
    verticalHeight: 0,
    centerDot: true,
    centerDotSize: 6,
    centerDotColor: '#ff0000',
    circle: false,
    circleRadius: 10,
    circleThickness: 2,
    circleColor: '#ff0000',
    offset: 0,
    transparency: 1,
    animation: 'pulse',
    animationSpeed: 1,
    gradient: false,
    gradientColors: ['#ff0000', '#ff6600'],
    rainbowMode: false,
  },
  {
    id: 'default-3',
    name: 'Circle Pro',
    category: 'circle',
    width: 6,
    height: 6,
    thickness: 2,
    gap: 4,
    opacity: 1,
    color: '#00ffff',
    hex: '#00ffff',
    glow: false,
    glowIntensity: 3,
    outline: true,
    outlineThickness: 1,
    rotation: 0,
    shadow: false,
    shadowBlur: 4,
    roundedEdges: false,
    horizontalWidth: 6,
    horizontalHeight: 6,
    verticalWidth: 6,
    verticalHeight: 6,
    centerDot: true,
    centerDotSize: 2,
    centerDotColor: '#00ffff',
    circle: true,
    circleRadius: 12,
    circleThickness: 2,
    circleColor: '#00ffff',
    offset: 0,
    transparency: 1,
    animation: 'none',
    animationSpeed: 1,
    gradient: false,
    gradientColors: ['#00ffff', '#0080ff'],
    rainbowMode: false,
  },
  {
    id: 'default-4',
    name: 'Tactical Green',
    category: 'tactical',
    width: 8,
    height: 8,
    thickness: 2,
    gap: 3,
    opacity: 1,
    color: '#00ff00',
    hex: '#00ff00',
    glow: false,
    glowIntensity: 3,
    outline: true,
    outlineThickness: 1,
    rotation: 0,
    shadow: false,
    shadowBlur: 4,
    roundedEdges: false,
    horizontalWidth: 8,
    horizontalHeight: 8,
    verticalWidth: 8,
    verticalHeight: 8,
    centerDot: true,
    centerDotSize: 2,
    centerDotColor: '#00ff00',
    circle: false,
    circleRadius: 10,
    circleThickness: 2,
    circleColor: '#00ff00',
    offset: 0,
    transparency: 1,
    animation: 'none',
    animationSpeed: 1,
    gradient: false,
    gradientColors: ['#00ff00', '#00cc00'],
    rainbowMode: false,
  },
  {
    id: 'default-5',
    name: 'Rainbow Dynamic',
    category: 'dynamic',
    width: 6,
    height: 6,
    thickness: 2,
    gap: 4,
    opacity: 1,
    color: '#ff0000',
    hex: '#ff0000',
    glow: true,
    glowIntensity: 4,
    outline: false,
    outlineThickness: 1,
    rotation: 0,
    shadow: false,
    shadowBlur: 4,
    roundedEdges: true,
    horizontalWidth: 6,
    horizontalHeight: 6,
    verticalWidth: 6,
    verticalHeight: 6,
    centerDot: false,
    centerDotSize: 4,
    centerDotColor: '#ffffff',
    circle: true,
    circleRadius: 14,
    circleThickness: 2,
    circleColor: '#ff0000',
    offset: 0,
    transparency: 1,
    animation: 'none',
    animationSpeed: 1,
    gradient: false,
    gradientColors: ['#ff0000', '#ff7f00'],
    rainbowMode: true,
  },
  {
    id: 'default-6',
    name: 'Minimal White',
    category: 'minimal',
    width: 4,
    height: 4,
    thickness: 1,
    gap: 6,
    opacity: 0.8,
    color: '#ffffff',
    hex: '#ffffff',
    glow: false,
    glowIntensity: 3,
    outline: false,
    outlineThickness: 1,
    rotation: 0,
    shadow: false,
    shadowBlur: 4,
    roundedEdges: false,
    horizontalWidth: 4,
    horizontalHeight: 4,
    verticalWidth: 4,
    verticalHeight: 4,
    centerDot: true,
    centerDotSize: 2,
    centerDotColor: '#ffffff',
    circle: false,
    circleRadius: 10,
    circleThickness: 2,
    circleColor: '#ffffff',
    offset: 0,
    transparency: 0.8,
    animation: 'none',
    animationSpeed: 1,
    gradient: false,
    gradientColors: ['#ffffff', '#cccccc'],
    rainbowMode: false,
  },
  {
    id: 'default-7',
    name: 'T-Shape Yellow',
    category: 'tshape',
    width: 6,
    height: 8,
    thickness: 2,
    gap: 3,
    opacity: 1,
    color: '#ffff00',
    hex: '#ffff00',
    glow: true,
    glowIntensity: 2,
    outline: false,
    outlineThickness: 1,
    rotation: 0,
    shadow: false,
    shadowBlur: 4,
    roundedEdges: false,
    horizontalWidth: 6,
    horizontalHeight: 6,
    verticalWidth: 6,
    verticalHeight: 8,
    centerDot: false,
    centerDotSize: 4,
    centerDotColor: '#ffff00',
    circle: false,
    circleRadius: 10,
    circleThickness: 2,
    circleColor: '#ffff00',
    offset: 0,
    transparency: 1,
    animation: 'none',
    animationSpeed: 1,
    gradient: false,
    gradientColors: ['#ffff00', '#ffcc00'],
    rainbowMode: false,
  },
  {
    id: 'default-8',
    name: 'Sniper Pink',
    category: 'sniper',
    width: 8,
    height: 8,
    thickness: 1,
    gap: 8,
    opacity: 1,
    color: '#ff69b4',
    hex: '#ff69b4',
    glow: true,
    glowIntensity: 3,
    outline: true,
    outlineThickness: 1,
    rotation: 45,
    shadow: false,
    shadowBlur: 4,
    roundedEdges: false,
    horizontalWidth: 8,
    horizontalHeight: 8,
    verticalWidth: 8,
    verticalHeight: 8,
    centerDot: true,
    centerDotSize: 2,
    centerDotColor: '#ff69b4',
    circle: false,
    circleRadius: 10,
    circleThickness: 2,
    circleColor: '#ff69b4',
    offset: 0,
    transparency: 1,
    animation: 'none',
    animationSpeed: 1,
    gradient: false,
    gradientColors: ['#ff69b4', '#ff1493'],
    rainbowMode: false,
  },
];

export const useCrosshairStore = create<CrosshairState>((set, get) => ({
  crosshairs: defaultCrosshairs,
  selectedId: 'default-1',
  recentIds: ['default-1', 'default-2', 'default-3'],
  favoriteIds: [],
  activeView: 'library',

  setSelected: (id) => set({ selectedId: id }),

  addCrosshair: (config) => {
    const id = uuidv4();
    const newCrosshair: CrosshairConfig = { ...config, id };
    set((state) => ({
      crosshairs: [...state.crosshairs, newCrosshair],
      selectedId: id,
    }));
    get().addToRecent(id);
    return id;
  },

  updateCrosshair: (id, updates) => {
    set((state) => ({
      crosshairs: state.crosshairs.map((ch) =>
        ch.id === id ? { ...ch, ...updates } : ch
      ),
    }));
  },

  deleteCrosshair: (id) => {
    set((state) => ({
      crosshairs: state.crosshairs.filter((ch) => ch.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
      recentIds: state.recentIds.filter((rid) => rid !== id),
      favoriteIds: state.favoriteIds.filter((fid) => fid !== id),
    }));
  },

  duplicateCrosshair: (id) => {
    const state = get();
    const original = state.crosshairs.find((ch) => ch.id === id);
    if (!original) return null;

    const newId = uuidv4();
    const duplicate: CrosshairConfig = {
      ...original,
      id: newId,
      name: `${original.name} (Copy)`,
    };

    set((state) => ({
      crosshairs: [...state.crosshairs, duplicate],
      selectedId: newId,
    }));

    return newId;
  },

  toggleFavorite: (id) => {
    set((state) => ({
      favoriteIds: state.favoriteIds.includes(id)
        ? state.favoriteIds.filter((fid) => fid !== id)
        : [...state.favoriteIds, id],
    }));
  },

  addToRecent: (id) => {
    set((state) => ({
      recentIds: [id, ...state.recentIds.filter((rid) => rid !== id)].slice(0, 10),
    }));
  },

  setActiveView: (view) => set({ activeView: view }),

  getSelected: () => {
    const state = get();
    return state.crosshairs.find((ch) => ch.id === state.selectedId) || null;
  },
}));
