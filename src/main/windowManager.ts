import { BrowserWindow, ipcMain, nativeTheme, app } from 'electron';
import path from 'path';
import fs from 'fs';

let mainWindow: BrowserWindow | null = null;

function getAppIcon(): string | undefined {
  const possiblePaths = [
    path.join(__dirname, '../../build/icon.ico'),
    path.join(__dirname, '../../dist/favicon.ico'),
    path.join(app.getAppPath(), 'build/icon.ico'),
    path.join(process.resourcesPath || '', 'build/icon.ico'),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return undefined;
}

export function createMainWindow(initialFiles: string[] = []): BrowserWindow {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 700,
    minHeight: 450,
    frame: false, // Frameless for custom Windows 11 Fluent Titlebar
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#202020' : '#f9f9f9',
    icon: getAppIcon(),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
  });

  // Smooth window show
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    if (initialFiles.length > 0) {
      mainWindow?.webContents.send('file:opened-multiple-from-cli', initialFiles);
    }
  });

  // Track maximize state
  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send('window:state-changed', { isMaximized: true });
  });

  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send('window:state-changed', { isMaximized: false });
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
  }

  return mainWindow;
}

export function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}

export function registerWindowIpcHandlers() {
  ipcMain.handle('window:minimize', () => {
    mainWindow?.minimize();
  });

  ipcMain.handle('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
    return mainWindow?.isMaximized();
  });

  ipcMain.handle('window:close', () => {
    mainWindow?.close();
  });

  ipcMain.handle('window:isMaximized', () => {
    return mainWindow?.isMaximized() || false;
  });
}
