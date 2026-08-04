import type { CrosshairConfig, CrosshairPreset, ExportPreset } from '../types';

const CROSSHAIR_FILE_VERSION = '1.0.0';
const SETTINGS_VERSION = '1.0.0';

export function downloadFile(data: string, filename: string, mimeType: string): void {
  const blob = data.startsWith('data:')
    ? (() => {
        const byteString = atob(data.split(',')[1]);
        const mimeTypeMatch = data.match(/data:([^;]+)/);
        const mime = mimeTypeMatch ? mimeTypeMatch[1] : mimeType;
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mime });
      })()
    : new Blob([data], { type: mimeType });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 100);
}

export async function exportCrosshairAsPNG(
  config: CrosshairConfig,
  size: number
): Promise<void> {
  const { renderCrosshairToDataURL } = await import('./crosshairRenderer');
  const dataUrl = renderCrosshairToDataURL(config, size);
  downloadFile(dataUrl, `${sanitizeFilename(config.name)}_crosshair.png`, 'image/png');
}

export async function exportCrosshairAsSVG(
  config: CrosshairConfig,
  size: number
): Promise<void> {
  const { renderCrosshairToSVG } = await import('./crosshairRenderer');
  const svg = renderCrosshairToSVG(config, size);
  downloadFile(svg, `${sanitizeFilename(config.name)}_crosshair.svg`, 'image/svg+xml');
}

export async function exportPreset(
  preset: CrosshairPreset,
  crosshair: CrosshairConfig
): Promise<void> {
  const exportData: ExportPreset = {
    version: CROSSHAIR_FILE_VERSION,
    preset,
    createdAt: new Date().toISOString(),
  };

  const json = JSON.stringify(exportData, null, 2);
  downloadFile(json, `${sanitizeFilename(preset.name)}.crosshair`, 'application/json');
}

export async function importPreset(
  file: File
): Promise<{ preset: CrosshairPreset; crosshair: CrosshairConfig }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result as string);

        if (!json.version || !json.preset || !json.preset.crosshair) {
          reject(new Error('Invalid crosshair preset file'));
          return;
        }

        resolve({
          preset: json.preset,
          crosshair: json.preset.crosshair,
        });
      } catch {
        reject(new Error('Failed to parse crosshair preset file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export async function exportAllPresets(
  presets: CrosshairPreset[]
): Promise<void> {
  const exportData = {
    version: CROSSHAIR_FILE_VERSION,
    presets,
    exportedAt: new Date().toISOString(),
  };

  const json = JSON.stringify(exportData, null, 2);
  downloadFile(json, `crosshair_presets_${Date.now()}.json`, 'application/json');
}

export async function exportSettings(settings: any): Promise<void> {
  const exportData = {
    version: SETTINGS_VERSION,
    settings,
    exportedAt: new Date().toISOString(),
  };

  const json = JSON.stringify(exportData, null, 2);
  downloadFile(json, `crosshair_settings_${Date.now()}.json`, 'application/json');
}

export async function importSettings(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result as string);

        if (!json.version || !json.settings) {
          reject(new Error('Invalid settings file'));
          return;
        }

        resolve(json.settings);
      } catch {
        reject(new Error('Failed to parse settings file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

function base64Encode(str: string): string {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    )
  );
}

function base64Decode(str: string): string {
  return decodeURIComponent(
    Array.from(atob(str), (c) =>
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join('')
  );
}

export function generateShareCode(crosshair: CrosshairConfig): string {
  const configStr = JSON.stringify({
    w: crosshair.width,
    h: crosshair.height,
    t: crosshair.thickness,
    g: crosshair.gap,
    o: crosshair.opacity,
    c: crosshair.color,
    x: crosshair.hex,
    gl: crosshair.glow,
    gi: crosshair.glowIntensity,
    ol: crosshair.outline,
    ot: crosshair.outlineThickness,
    r: crosshair.rotation,
    s: crosshair.shadow,
    sb: crosshair.shadowBlur,
    re: crosshair.roundedEdges,
    hw: crosshair.horizontalWidth,
    hh: crosshair.horizontalHeight,
    vw: crosshair.verticalWidth,
    vh: crosshair.verticalHeight,
    cd: crosshair.centerDot,
    cds: crosshair.centerDotSize,
    cdc: crosshair.centerDotColor,
    ci: crosshair.circle,
    cr: crosshair.circleRadius,
    cct: crosshair.circleThickness,
    cc: crosshair.circleColor,
    off: crosshair.offset,
    tr: crosshair.transparency,
    a: crosshair.animation,
    as: crosshair.animationSpeed,
    gr: crosshair.gradient,
    gc: crosshair.gradientColors,
    rm: crosshair.rainbowMode,
  });

  return base64Encode(configStr);
}

export function decodeShareCode(code: string): CrosshairConfig {
  try {
    const jsonStr = base64Decode(code);
    const data = JSON.parse(jsonStr);

    return {
      id: `share_${Date.now()}`,
      name: 'Shared Crosshair',
      category: 'custom',
      size: data.sz ?? 1,
      width: data.w ?? 24,
      height: data.h ?? 24,
      thickness: data.t ?? 2,
      gap: data.g ?? 4,
      opacity: data.o ?? 1,
      color: data.c ?? '#00ff00',
      hex: data.x ?? '#00ff00',
      glow: data.gl ?? false,
      glowIntensity: data.gi ?? 5,
      outline: data.ol ?? false,
      outlineThickness: data.ot ?? 1,
      rotation: data.r ?? 0,
      shadow: data.s ?? false,
      shadowBlur: data.sb ?? 4,
      roundedEdges: data.re ?? false,
      horizontalWidth: data.hw ?? 24,
      horizontalHeight: data.hh ?? 2,
      verticalWidth: data.vw ?? 2,
      verticalHeight: data.vh ?? 24,
      centerDot: data.cd ?? false,
      centerDotSize: data.cds ?? 2,
      centerDotColor: data.cdc ?? data.c ?? '#00ff00',
      circle: data.ci ?? false,
      circleRadius: data.cr ?? 10,
      circleThickness: data.cct ?? 2,
      circleColor: data.cc ?? data.c ?? '#00ff00',
      offset: data.off ?? 0,
      transparency: data.tr ?? 1,
      animation: data.a ?? 'none',
      animationSpeed: data.as ?? 1,
      gradient: data.gr ?? false,
      gradientColors: data.gc ?? ['#00ff00'],
      rainbowMode: data.rm ?? false,
    };
  } catch {
    throw new Error('Invalid share code');
  }
}
