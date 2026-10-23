import { app, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import { createMainWindow, getMainWindow, registerWindowIpcHandlers } from './windowManager';
import { registerFileIpcHandlers, closeWatcher } from './fileManager';

// Windows Application UserModelID
if (process.platform === 'win32') {
  app.setAppUserModelId('com.batchstudio.batchviewer');
}

function extractFilePaths(argv: string[]): string[] {
  const files: string[] = [];
  for (let i = 1; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg || arg.startsWith('-')) continue;
    if (!app.isPackaged && (arg.includes('vite') || arg.endsWith('electron.exe') || arg.endsWith('electron'))) {
      continue;
    }
    if (fs.existsSync(arg)) {
      files.push(path.resolve(arg));
    }
  }
  return files;
}

// Initial CLI arguments
const pendingFilePaths: string[] = extractFilePaths(process.argv);
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  // Single Instance Focus & Open CLI files
  app.on('second-instance', (_event, argv) => {
    const win = getMainWindow();
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();

      const newFiles = extractFilePaths(argv);
      if (newFiles.length > 0) {
        win.webContents.send('file:opened-multiple-from-cli', newFiles);
      }
    }
  });

  app.whenReady().then(() => {
    registerWindowIpcHandlers();
    registerFileIpcHandlers();

    ipcMain.handle('file:get-initial-files', () => {
      return pendingFilePaths;
    });

    createMainWindow(pendingFilePaths);
  });
}

// App lifecycle
app.on('window-all-closed', () => {
  closeWatcher();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
