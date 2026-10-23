import { ipcMain, dialog, shell } from 'electron';
import path from 'path';
import fs from 'fs';
import { getMainWindow } from './windowManager';

let currentWatchedFile: string | null = null;
let fileWatcher: fs.FSWatcher | null = null;

export function closeWatcher() {
  if (fileWatcher) {
    fileWatcher.close();
    fileWatcher = null;
  }
  currentWatchedFile = null;
}

function isValidPath(filePath: unknown): filePath is string {
  return typeof filePath === 'string' && filePath.trim().length > 0 && !filePath.includes('\0');
}

async function scanDirectoryFiles(dirPath: string) {
  try {
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    const supportedExts = new Set(['.md', '.markdown', '.mdown', '.mkd', '.mdx', '.pdf', '.docx', '.doc', '.txt', '.log', '.json', '.csv']);
    const files: Array<{ name: string; path: string; size: number }> = [];

    for (const entry of entries) {
      if (files.length >= 1000) break; // Safeguard against massive directories
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;

      if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (supportedExts.has(ext)) {
          const fullPath = path.join(dirPath, entry.name);
          let size = 0;
          try {
            const stat = await fs.promises.stat(fullPath);
            size = stat.size;
          } catch { }
          files.push({ name: entry.name, path: fullPath, size });
        }
      }
    }
    return { dirPath, folderName: path.basename(dirPath), files };
  } catch (err: any) {
    return { dirPath, folderName: path.basename(dirPath), files: [], error: err.message };
  }
}

export function registerFileIpcHandlers() {
  // File Open Dialog
  ipcMain.handle('file:open-dialog', async () => {
    const win = getMainWindow();
    if (!win) return null;

    const result = await dialog.showOpenDialog(win, {
      title: 'Open Document(s)',
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'All Supported Documents', extensions: ['md', 'markdown', 'mdown', 'mkd', 'mdx', 'txt', 'log', 'pdf', 'docx', 'doc', 'json', 'csv'] },
        { name: 'Markdown Documents (*.md)', extensions: ['md', 'markdown', 'mdown', 'mkd', 'mdx'] },
        { name: 'PDF Documents (*.pdf)', extensions: ['pdf'] },
        { name: 'Word Documents (*.docx)', extensions: ['docx', 'doc'] },
        { name: 'Text & Log Files (*.txt, *.log)', extensions: ['txt', 'log', 'json', 'csv', 'yaml', 'yml'] },
        { name: 'All Files (*.*)', extensions: ['*'] },
      ],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }
    return result.filePaths;
  });

  // Open Folder Dialog
  ipcMain.handle('file:open-directory-dialog', async () => {
    const win = getMainWindow();
    if (!win) return null;

    const result = await dialog.showOpenDialog(win, {
      title: 'Open Folder in Batch-Viewer',
      properties: ['openDirectory'],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }
    return await scanDirectoryFiles(result.filePaths[0]);
  });

  // Open Folder by Direct Path (e.g. Drag and Drop)
  ipcMain.handle('file:open-directory-path', async (_event, dirPath: string) => {
    if (!isValidPath(dirPath) || !fs.existsSync(dirPath)) return null;
    return await scanDirectoryFiles(dirPath);
  });

  // Check Path Info (Directory vs File)
  ipcMain.handle('file:get-path-info', async (_event, targetPath: string) => {
    if (!isValidPath(targetPath) || !fs.existsSync(targetPath)) {
      return { exists: false, isDirectory: false, isFile: false };
    }
    try {
      const stat = await fs.promises.stat(targetPath);
      return {
        exists: true,
        isDirectory: stat.isDirectory(),
        isFile: stat.isFile(),
      };
    } catch {
      return { exists: false, isDirectory: false, isFile: false };
    }
  });

  // Read Text File
  ipcMain.handle('file:read', async (_event, filePath: string) => {
    if (!isValidPath(filePath)) {
      return { success: false, error: 'Invalid file path' };
    }
    try {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const stats = await fs.promises.stat(filePath);
      return {
        success: true,
        content,
        filePath,
        fileName: path.basename(filePath),
        dirName: path.dirname(filePath),
        lastModified: stats.mtimeMs,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Read Binary File (PDF / Word)
  ipcMain.handle('file:read-binary', async (_event, filePath: string) => {
    if (!isValidPath(filePath)) {
      return { success: false, error: 'Invalid file path' };
    }
    try {
      const buffer = await fs.promises.readFile(filePath);
      const stats = await fs.promises.stat(filePath);
      return {
        success: true,
        base64: buffer.toString('base64'),
        filePath,
        fileName: path.basename(filePath),
        dirName: path.dirname(filePath),
        lastModified: stats.mtimeMs,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Save Text File
  ipcMain.handle('file:save', async (_event, filePath: string, content: string) => {
    if (!isValidPath(filePath)) {
      return { success: false, error: 'Invalid file path' };
    }
    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        await fs.promises.mkdir(dir, { recursive: true });
      }
      await fs.promises.writeFile(filePath, content ?? '', 'utf-8');
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Save Binary File
  ipcMain.handle('file:save-binary', async (_event, filePath: string, base64: string) => {
    if (!isValidPath(filePath)) {
      return { success: false, error: 'Invalid file path' };
    }
    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        await fs.promises.mkdir(dir, { recursive: true });
      }
      const buffer = Buffer.from(base64 || '', 'base64');
      await fs.promises.writeFile(filePath, buffer);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Save Dialog
  ipcMain.handle('file:save-dialog', async (_event, defaultName = 'Untitled.md') => {
    const win = getMainWindow();
    if (!win) return null;

    const ext = path.extname(defaultName).toLowerCase().replace('.', '');
    const filters = [];
    if (ext === 'pdf') {
      filters.push({ name: 'PDF Document (*.pdf)', extensions: ['pdf'] });
    } else if (ext === 'docx') {
      filters.push({ name: 'Word Document (*.docx)', extensions: ['docx'] });
    } else if (ext === 'txt') {
      filters.push({ name: 'Text Document (*.txt)', extensions: ['txt'] });
    } else {
      filters.push({ name: 'Markdown Document (*.md)', extensions: ['md'] });
    }
    filters.push({ name: 'All Files (*.*)', extensions: ['*'] });

    const result = await dialog.showSaveDialog(win, {
      title: 'Save Document',
      defaultPath: defaultName,
      filters,
    });

    if (result.canceled || !result.filePath) {
      return null;
    }
    return result.filePath;
  });

  // File Watching
  ipcMain.handle('file:watch', (_event, filePath: string) => {
    if (fileWatcher) {
      fileWatcher.close();
      fileWatcher = null;
    }
    currentWatchedFile = filePath;

    if (fs.existsSync(filePath)) {
      let debounceTimer: NodeJS.Timeout | null = null;
      fileWatcher = fs.watch(filePath, (eventType) => {
        if (eventType === 'change') {
          if (debounceTimer) clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            getMainWindow()?.webContents.send('file:changed-on-disk', filePath);
          }, 150);
        }
      });
    }
    return true;
  });

  ipcMain.handle('file:unwatch', () => {
    closeWatcher();
    return true;
  });

  // Export to PDF
  ipcMain.handle('file:export-pdf', async () => {
    const win = getMainWindow();
    if (!win) return { success: false, error: 'No active window' };

    const saveResult = await dialog.showSaveDialog(win, {
      title: 'Export to PDF',
      defaultPath: 'Document.pdf',
      filters: [{ name: 'PDF Document (*.pdf)', extensions: ['pdf'] }],
    });

    if (saveResult.canceled || !saveResult.filePath) {
      return { success: false, canceled: true };
    }

    try {
      const data = await win.webContents.printToPDF({
        printBackground: true,
        pageSize: 'A4',
        margins: { marginType: 'default' },
      });
      await fs.promises.writeFile(saveResult.filePath, data);
      return { success: true, path: saveResult.filePath };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  // Export to HTML
  ipcMain.handle('file:export-html', async (_event, defaultName = 'Document.html', htmlContent: string) => {
    const win = getMainWindow();
    if (!win) return { success: false, error: 'No active window' };

    const saveResult = await dialog.showSaveDialog(win, {
      title: 'Export Document to HTML',
      defaultPath: defaultName,
      filters: [{ name: 'HTML Document (*.html)', extensions: ['html'] }],
    });

    if (saveResult.canceled || !saveResult.filePath) {
      return { success: false, canceled: true };
    }

    try {
      await fs.promises.writeFile(saveResult.filePath, htmlContent, 'utf-8');
      return { success: true, path: saveResult.filePath };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  // Shell Helpers
  ipcMain.handle('shell:show-in-folder', async (_event, filePath: string) => {
    if (filePath && fs.existsSync(filePath)) {
      shell.showItemInFolder(filePath);
      return true;
    }
    return false;
  });

  ipcMain.handle('shell:open-external', async (_event, url: string) => {
    if (!url || typeof url !== 'string') return;
    try {
      const parsed = new URL(url);
      if (['http:', 'https:', 'mailto:'].includes(parsed.protocol)) {
        await shell.openExternal(url);
      }
    } catch { }
  });
}
