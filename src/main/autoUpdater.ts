import { autoUpdater, UpdateInfo } from 'electron-updater';
import { app, ipcMain, BrowserWindow } from 'electron';

let mainWindowRef: BrowserWindow | null = null;
let isUpdateAvailable = false;
let isDownloading = false;

export function registerAutoUpdater(win: BrowserWindow) {
  mainWindowRef = win;

  // Don't auto-download without user consent
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  // Auto Updater Events
  autoUpdater.on('update-available', (info: UpdateInfo) => {
    isUpdateAvailable = true;
    if (mainWindowRef && !mainWindowRef.isDestroyed()) {
      mainWindowRef.webContents.send('update:available', {
        version: info.version,
        releaseDate: info.releaseDate,
        releaseNotes: info.releaseNotes,
      });
    }
  });

  autoUpdater.on('update-not-available', () => {
    if (mainWindowRef && !mainWindowRef.isDestroyed()) {
      mainWindowRef.webContents.send('update:not-available');
    }
  });

  autoUpdater.on('download-progress', (progressObj) => {
    isDownloading = true;
    if (mainWindowRef && !mainWindowRef.isDestroyed()) {
      mainWindowRef.webContents.send('update:progress', {
        percent: Math.round(progressObj.percent),
        bytesPerSecond: progressObj.bytesPerSecond,
        transferred: progressObj.transferred,
        total: progressObj.total,
      });
    }
  });

  autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
    isDownloading = false;
    if (mainWindowRef && !mainWindowRef.isDestroyed()) {
      mainWindowRef.webContents.send('update:downloaded', {
        version: info.version,
      });
    }
  });

  autoUpdater.on('error', (err) => {
    isDownloading = false;
    console.error('AutoUpdater Error:', err?.message || err);
    if (mainWindowRef && !mainWindowRef.isDestroyed()) {
      mainWindowRef.webContents.send('update:error', err?.message || 'Unknown update error');
    }
  });

  // Background check 6 seconds after startup
  if (app.isPackaged) {
    setTimeout(() => {
      checkForUpdatesSilently();
    }, 6000);
  }
}

export function registerUpdateIpcHandlers() {
  ipcMain.handle('update:check', async () => {
    try {
      const result = await autoUpdater.checkForUpdates();
      return { success: true, updateInfo: result?.updateInfo };
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  });

  ipcMain.handle('update:start-download', async () => {
    try {
      if (isDownloading) return { success: true, alreadyDownloading: true };
      await autoUpdater.downloadUpdate();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  });

  ipcMain.handle('update:install-now', () => {
    // Closes the app and launches the silent / interactive installer
    autoUpdater.quitAndInstall(false, true);
    return true;
  });
}

function checkForUpdatesSilently() {
  try {
    autoUpdater.checkForUpdates().catch((err) => {
      console.warn('Silent update check failed:', err?.message);
    });
  } catch (err) {
    console.warn('AutoUpdater initiation error:', err);
  }
}

