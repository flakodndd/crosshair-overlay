import { app, BrowserWindow, ipcMain, screen, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { getSettings } from './store';
import {
  createOverlayWindow,
  getOverlayWindow,
  showOverlay,
  hideOverlay,
  moveOverlay,
  resizeOverlay,
  lockOverlay,
  unlockOverlay,
  setOverlayOpacity,
  setAlwaysOnTop,
  sendToOverlay,
  destroyOverlay,
} from './overlay';
import { registerAllHotkeys, unregisterAllHotkeys, updateHotkeys } from './hotkeys';
import { createTray, destroyTray, updateTrayContextMenu } from './tray';
import { setupAutoUpdater, quitAndInstall, checkForUpdates } from './updater';

let mainWindow: BrowserWindow | null = null;

export function getMainWindow(): BrowserWindow | null {
  if (mainWindow && !mainWindow.isDestroyed()) {
    return mainWindow;
  }
  return null;
}

function createMainWindow(): BrowserWindow {
  const settings = getSettings();
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  const windowWidth = 1200;
  const windowHeight = 800;
  const x = Math.round((screenWidth - windowWidth) / 2);
  const y = Math.round((screenHeight - windowHeight) / 2);

  mainWindow = new BrowserWindow({
    x,
    y,
    width: windowWidth,
    height: windowHeight,
    minWidth: 600,
    minHeight: 400,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0f0f14',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.setMenuBarVisibility(false);

  if (process.platform === 'darwin') {
    mainWindow.setTitleBarOverlay({
      color: '#0f0f14',
      symbolColor: '#ffffff',
      height: 32,
    });
  }

  const devUrl = 'http://localhost:5173';
  const prodUrl = `file://${path.join(__dirname, '../renderer/index.html')}`;
  const useDev = !fs.existsSync(path.join(__dirname, '../renderer/index.html'));
  const resolvedUrl = useDev ? devUrl : prodUrl;

  mainWindow.loadURL(resolvedUrl).catch((err) => {
    console.error('Failed to load main URL:', err);
    dialog.showErrorBox('Load Error', `Failed to load application: ${err.message}`);
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('close', (event) => {
    const settingsInstance = getSettings();
    if (settingsInstance.get('minimizeToTray')) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send('window:maximized');
  });

  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send('window:unmaximized');
  });

  return mainWindow;
}

function setupIpcHandlers(): void {
  ipcMain.on('overlay:show', () => {
    showOverlay();
  });

  ipcMain.on('overlay:hide', () => {
    hideOverlay();
  });

  ipcMain.on('overlay:move', (_event, x: number, y: number) => {
    moveOverlay(x, y);
  });

  ipcMain.on('overlay:resize', (_event, width: number, height: number) => {
    resizeOverlay(width, height);
  });

  ipcMain.on('overlay:lock', () => {
    lockOverlay();
  });

  ipcMain.on('overlay:unlock', () => {
    unlockOverlay();
  });

  ipcMain.on('overlay:set-opacity', (_event, opacity: number) => {
    setOverlayOpacity(opacity);
  });

  ipcMain.on('overlay:always-on-top', (_event, alwaysOnTop: boolean) => {
    setAlwaysOnTop(alwaysOnTop);
  });

  ipcMain.on('crosshair:set', (_event, config) => {
    console.log('[Main] Received crosshair:set', JSON.stringify(config).substring(0, 100));
    sendToOverlay('crosshair:update', config);
  });

  ipcMain.on('crosshair:request', () => {
    console.log('[Main] Received crosshair:request');
    const settings = getSettings();
    const crosshair = settings.get('crosshair');
    if (crosshair) {
      sendToOverlay('crosshair:update', crosshair);
    }
  });

  ipcMain.on('app:quit', () => {
    app.quit();
  });

  ipcMain.on('app:minimize', () => {
    mainWindow?.minimize();
  });

  ipcMain.on('app:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });

  ipcMain.on('app:toggle-devtools', () => {
    mainWindow?.webContents.toggleDevTools();
  });

  ipcMain.on('app:get-version', (event) => {
    event.returnValue = app.getVersion();
  });

  ipcMain.on('tray:setup', () => {
    createTray();
  });

  ipcMain.on('app:set-startup', (_event, enabled: boolean) => {
    app.setLoginItemSettings({
      openAtLogin: enabled,
      openAsHidden: true,
    });
  });

  ipcMain.on('update:install', () => {
    quitAndInstall();
  });

  ipcMain.on('update:check', () => {
    checkForUpdates();
  });

  ipcMain.handle('settings:get', (_event, key: string) => {
    const settings = getSettings();
    return settings.get(key as never);
  });

  ipcMain.handle('settings:set', (_event, key: string, value: unknown) => {
    const settings = getSettings();
    settings.set(key as never, value as never);
    updateTrayContextMenu();
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send(`settings:changed:${key}`, value);
    }
  });

  ipcMain.handle('settings:get-all', () => {
    const settings = getSettings();
    return settings.getAll();
  });
}

function setupSettingsListeners(): void {
  const settings = getSettings();

  settings.onDidChange('hotkeys', (newHotkeys) => {
    if (newHotkeys) {
      updateHotkeys(newHotkeys);
    }
  });

  settings.onDidChange('overlay', () => {
    updateTrayContextMenu();
  });
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const win = getMainWindow();
    if (win) {
      if (win.isMinimized()) {
        win.restore();
      }
      win.show();
      win.focus();
    }
  });

  app.whenReady().then(() => {
    app.setAppUserModelId('com.crosshair.overlay');

    setupIpcHandlers();

    createMainWindow();
    createOverlayWindow();
    createTray();
    registerAllHotkeys();
    setupSettingsListeners();
    setupAutoUpdater(getMainWindow());

  const settings = getSettings();
  if (settings.get('overlay').visible) {
    showOverlay();
  }

  // Send saved crosshair to overlay on startup
  const savedCrosshair = settings.get('crosshair');
  if (savedCrosshair) {
    setTimeout(() => {
      sendToOverlay('crosshair:update', savedCrosshair);
    }, 500);
  }

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
      }
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('before-quit', () => {
    unregisterAllHotkeys();
    destroyOverlay();
    destroyTray();
  });

  app.on('will-quit', () => {
    unregisterAllHotkeys();
  });
}

app.commandLine.appendSwitch('enable-features', 'SharedArrayBuffer');
app.commandLine.appendSwitch('disable-renderer-backgrounding');
