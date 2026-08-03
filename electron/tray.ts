import { Tray, Menu, nativeImage, BrowserWindow, app } from 'electron';
import * as path from 'path';
import { getMainWindow } from './main';
import { getOverlayWindow, showOverlay, hideOverlay } from './overlay';

let tray: Tray | null = null;

function createTrayIcon(): Electron.NativeImage {
  const size = 16;
  const buffer = Buffer.alloc(size * size * 4);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const offset = (y * size + x) * 4;
      const centerX = size / 2;
      const centerY = size / 2;
      const distX = Math.abs(x - centerX);
      const distY = Math.abs(y - centerY);

      const isCrosshair =
        (distX <= 1 && distY < size / 2) || (distY <= 1 && distX < size / 2);
      const isCenter = distX === 0 && distY === 0;
      const isEdge =
        x === 0 || x === size - 1 || y === 0 || y === size - 1;

      if (isCenter) {
        buffer[offset] = 255;
        buffer[offset + 1] = 50;
        buffer[offset + 2] = 50;
        buffer[offset + 3] = 255;
      } else if (isCrosshair) {
        buffer[offset] = 0;
        buffer[offset + 1] = 255;
        buffer[offset + 2] = 100;
        buffer[offset + 3] = 255;
      } else if (isEdge) {
        buffer[offset] = 60;
        buffer[offset + 1] = 60;
        buffer[offset + 2] = 60;
        buffer[offset + 3] = 255;
      } else {
        buffer[offset] = 0;
        buffer[offset + 1] = 0;
        buffer[offset + 2] = 0;
        buffer[offset + 3] = 0;
      }
    }
  }

  return nativeImage.createFromBuffer(buffer, {
    width: size,
    height: size,
    scaleFactor: 1.0,
  });
}

export function createTray(): Tray {
  if (tray && !tray.isDestroyed()) {
    return tray;
  }

  const icon = createTrayIcon();
  tray = new Tray(icon);
  tray.setToolTip('Crosshair Overlay');

  updateTrayContextMenu();

  tray.on('double-click', () => {
    const mainWindow = getMainWindow();
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.show();
      mainWindow.focus();
    }
  });

  return tray;
}

export function updateTrayContextMenu(): void {
  if (!tray || tray.isDestroyed()) return;

  const overlay = getOverlayWindow();
  const isOverlayVisible = overlay ? overlay.isVisible() : false;

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        const mainWindow = getMainWindow();
        if (mainWindow) {
          if (mainWindow.isMinimized()) {
            mainWindow.restore();
          }
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    { type: 'separator' },
    {
      label: isOverlayVisible ? 'Hide Overlay' : 'Show Overlay',
      click: () => {
        if (isOverlayVisible) {
          hideOverlay();
        } else {
          showOverlay();
        }
        updateTrayContextMenu();
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
}

export function destroyTray(): void {
  if (tray && !tray.isDestroyed()) {
    tray.destroy();
    tray = null;
  }
}

export function getTray(): Tray | null {
  return tray;
}
