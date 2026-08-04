export type Category =
  | 'dot'
  | 'classic'
  | 'tactical'
  | 'circle'
  | 'dynamic'
  | 'tshape'
  | 'sniper'
  | 'hollow'
  | 'minimal'
  | 'esports'
  | 'fps'
  | 'retro'
  | 'premium'
  | 'custom';

export type AnimationType =
  | 'none'
  | 'pulse'
  | 'breathe'
  | 'fade'
  | 'rotate'
  | 'scale';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface CrosshairConfig {
  id: string;
  name: string;
  category: Category;
  size: number;
  width: number;
  height: number;
  thickness: number;
  gap: number;
  opacity: number;
  color: string;
  hex: string;
  glow: boolean;
  glowIntensity: number;
  outline: boolean;
  outlineThickness: number;
  rotation: number;
  shadow: boolean;
  shadowBlur: number;
  roundedEdges: boolean;
  horizontalWidth: number;
  horizontalHeight: number;
  verticalWidth: number;
  verticalHeight: number;
  centerDot: boolean;
  centerDotSize: number;
  centerDotColor: string;
  circle: boolean;
  circleRadius: number;
  circleThickness: number;
  circleColor: string;
  offset: number;
  offsetX: number;
  offsetY: number;
  transparency: number;
  animation: AnimationType;
  animationSpeed: number;
  gradient: boolean;
  gradientColors: string[];
  rainbowMode: boolean;
  customImage?: string;
}

export interface CrosshairPreset {
  id: string;
  name: string;
  crosshair: CrosshairConfig;
  size: number;
  position: { x: number; y: number };
  opacity: number;
  overlayOpacity: number;
  locked: boolean;
  createdAt: string;
  updatedAt: string;
  favorite: boolean;
  folder: string;
}

export interface GameProfile {
  id: string;
  name: string;
  icon: string;
  crosshairPresetId: string;
  size: number;
  position: { x: number; y: number };
  opacity: number;
  overlayOpacity: number;
  overlaySettings: OverlaySettings;
}

export interface OverlaySettings {
  visible: boolean;
  locked: boolean;
  position: { x: number; y: number };
  size: { w: number; h: number };
  opacity: number;
  alwaysOnTop: boolean;
  multiMonitor: boolean;
}

export interface HotkeyConfig {
  action: string;
  key: string;
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
}

export interface AppSettings {
  theme: ThemeMode;
  accentColor: string;
  overlay: OverlaySettings;
  hotkeys: HotkeyConfig[];
  profiles: GameProfile[];
  startup: boolean;
  uiScale: number;
  highContrast: boolean;
}

export interface Theme {
  mode: ThemeMode;
  accentColor: string;
}

export interface PNGImport {
  file: File;
  dataUrl: string;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  maintainAspectRatio: boolean;
}

export interface ExportPreset {
  version: string;
  preset: CrosshairPreset;
  createdAt: string;
}
