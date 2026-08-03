import { app, BrowserWindow } from 'electron';
import { autoUpdater, UpdateInfo } from 'electron-updater';
import log from 'electron-log';

autoUpdater.logger = log;
(autoUpdater.logger as any).transports.file.level = 'info';

export function setupAutoUpdater(mainWindow: BrowserWindow | null): void {
  if (!app.isPackaged) {
    log.info('[Updater] Skipping in development mode');
    return;
  }

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update', () => {
    log.info('[Updater] Checking for updates...');
    sendToRenderer(mainWindow, 'update:status', { state: 'checking' });
  });

  autoUpdater.on('update-available', (info: UpdateInfo) => {
    log.info('[Updater] Update available:', info.version);
    sendToRenderer(mainWindow, 'update:status', {
      state: 'available',
      version: info.version,
      releaseDate: info.releaseDate,
    });
  });

  autoUpdater.on('update-not-available', () => {
    log.info('[Updater] No update available');
    sendToRenderer(mainWindow, 'update:status', { state: 'not-available' });
  });

  autoUpdater.on('download-progress', (progress) => {
    sendToRenderer(mainWindow, 'update:progress', {
      percent: Math.round(progress.percent),
      bytesPerSecond: progress.bytesPerSecond,
      transferred: progress.transferred,
      total: progress.total,
    });
  });

  autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
    log.info('[Updater] Update downloaded:', info.version);
    sendToRenderer(mainWindow, 'update:status', {
      state: 'downloaded',
      version: info.version,
    });
  });

  autoUpdater.on('error', (err) => {
    log.error('[Updater] Error:', err);
    sendToRenderer(mainWindow, 'update:status', {
      state: 'error',
      message: err.message,
    });
  });

  // Check after a short delay so the window has time to load
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch((err) => {
      log.error('[Updater] Check failed:', err);
    });
  }, 5000);
}

export function quitAndInstall(): void {
  autoUpdater.quitAndInstall();
}

export function checkForUpdates(): void {
  if (app.isPackaged) {
    autoUpdater.checkForUpdates().catch((err) => {
      log.error('[Updater] Manual check failed:', err);
    });
  }
}

function sendToRenderer(
  mainWindow: BrowserWindow | null,
  channel: string,
  data: Record<string, unknown>
): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, data);
  }
}
