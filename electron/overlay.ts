import { BrowserWindow, screen, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { getSettings } from './store';

let overlayWindow: BrowserWindow | null = null;
let isLocked = false;

export function createOverlayWindow(): BrowserWindow | null {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    return overlayWindow;
  }

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  const size = 200;
  const x = Math.round((screenWidth - size) / 2);
  const y = Math.round((screenHeight - size) / 2);

   overlayWindow = new BrowserWindow({
     x,
     y,
     width: size,
     height: size,
     minWidth: size,
     minHeight: size,
     transparent: true,
     frame: false,
     resizable: false,
     movable: true,
     skipTaskbar: true,
     alwaysOnTop: true,
     hasShadow: false,
     backgroundColor: '#00000000',
     webPreferences: {
       preload: path.join(__dirname, 'preload.js'),
       contextIsolation: true,
       nodeIntegration: false,
       sandbox: false,
     },
   });

  overlayWindow.setAlwaysOnTop(true, 'screen-saver');
  overlayWindow.setIgnoreMouseEvents(true, { forward: true });
  overlayWindow.setSkipTaskbar(true);

  if (process.platform === 'darwin') {
    overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    overlayWindow.setWindowButtonVisibility(false);
  }

  const devUrl = 'http://localhost:5173/overlay.html';
  const prodUrl = `file://${path.join(__dirname, '../renderer/overlay.html')}`;
  const useDev = !fs.existsSync(path.join(__dirname, '../renderer/index.html'));
  const overlayUrl = useDev ? devUrl : prodUrl;

  overlayWindow.loadURL(overlayUrl).then(() => {
    console.log('[Overlay] Loaded URL:', overlayUrl);
  }).catch((err) => {
    console.error('[Overlay] Failed to load URL:', err);
  });

  // When overlay finishes loading, send the current crosshair
  overlayWindow.webContents.on('did-finish-load', () => {
    console.log('[Overlay] Finished loading, sending current crosshair');
    const settings = getSettings();
    const crosshair = settings.get('crosshair');
    if (crosshair) {
      setTimeout(() => {
        sendToOverlay('crosshair:update', crosshair);
      }, 200);
    }
  });

  overlayWindow.on('closed', () => {
    overlayWindow = null;
  });

  const settings = getSettings();
  if (settings.get('overlay').locked) {
    isLocked = true;
  }

  return overlayWindow;
}

export function getOverlayWindow(): BrowserWindow | null {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    return overlayWindow;
  }
  return null;
}

export function showOverlay(): void {
  const win = getOverlayWindow();
  if (win) {
    console.log('[Overlay] Showing overlay window, visible:', win.isVisible(), 'minimized:', win.isMinimized());
    win.show();
    win.setAlwaysOnTop(true, 'screen-saver');
    console.log('[Overlay] After show, visible:', win.isVisible());
    const settings = getSettings();
    settings.set('overlay', { ...settings.get('overlay'), visible: true });
  } else {
    console.log('[Overlay] Cannot show - overlay window is null');
  }
}

export function hideOverlay(): void {
  const win = getOverlayWindow();
  if (win) {
    win.hide();
    const settings = getSettings();
    settings.set('overlay', { ...settings.get('overlay'), visible: false });
  }
}

export function moveOverlay(x: number, y: number): void {
  const win = getOverlayWindow();
  if (win && !isLocked) {
    win.setPosition(x, y);
    const settings = getSettings();
    settings.set('overlay', { ...settings.get('overlay'), x, y });
  }
}

export function resizeOverlay(width: number, height: number): void {
  const win = getOverlayWindow();
  if (win && !isLocked) {
    const clampedWidth = Math.max(50, Math.min(800, width));
    const clampedHeight = Math.max(50, Math.min(800, height));
    win.setSize(clampedWidth, clampedHeight);
    const settings = getSettings();
    settings.set('overlay', {
      ...settings.get('overlay'),
      width: clampedWidth,
      height: clampedHeight,
    });
  }
}

export function lockOverlay(): void {
  isLocked = true;
  const win = getOverlayWindow();
  if (win) {
    win.setMovable(false);
    const settings = getSettings();
    settings.set('overlay', { ...settings.get('overlay'), locked: true });
  }
}

export function unlockOverlay(): void {
  isLocked = false;
  const win = getOverlayWindow();
  if (win) {
    win.setMovable(true);
    const settings = getSettings();
    settings.set('overlay', { ...settings.get('overlay'), locked: false });
  }
}

export function setOverlayOpacity(opacity: number): void {
  const win = getOverlayWindow();
  if (win) {
    const clampedOpacity = Math.max(0.1, Math.min(1.0, opacity));
    win.setOpacity(clampedOpacity);
    const settings = getSettings();
    settings.set('overlay', {
      ...settings.get('overlay'),
      opacity: clampedOpacity,
    });
  }
}

export function setAlwaysOnTop(alwaysOnTop: boolean): void {
  const win = getOverlayWindow();
  if (win) {
    win.setAlwaysOnTop(alwaysOnTop, 'screen-saver');
    const settings = getSettings();
    settings.set('overlay', {
      ...settings.get('overlay'),
      alwaysOnTop,
    });
  }
}

export function sendToOverlay(channel: string, ...args: unknown[]): void {
  const win = getOverlayWindow();
  if (win && !win.isDestroyed() && win.webContents) {
    console.log(`[Overlay] Sending ${channel} to overlay`);
    win.webContents.send(channel, ...args);
  } else {
    console.log(`[Overlay] Cannot send ${channel} - overlay window not available`);
  }
}

export function destroyOverlay(): void {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.destroy();
    overlayWindow = null;
  }
  isLocked = false;
}
