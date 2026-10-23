import { contextBridge, ipcRenderer, webUtils } from 'electron';

export interface FileData {
  success: boolean;
  content?: string;
  filePath?: string;
  fileName?: string;
  dirName?: string;
  lastModified?: number;
  error?: string;
}

export interface BinaryFileData {
  success: boolean;
  base64?: string;
  filePath?: string;
  fileName?: string;
  dirName?: string;
  lastModified?: number;
  error?: string;
}

export interface FolderFileEntry {
  name: string;
  path: string;
  size: number;
}

export interface ElectronAPI {
  // Window
  minimize: () => Promise<void>;
  maximize: () => Promise<boolean>;
  close: () => Promise<void>;
  isMaximized: () => Promise<boolean>;
  onWindowStateChanged: (callback: (isMaximized: boolean) => void) => () => void;

  // File IO
  openFileDialog: () => Promise<string[] | null>;
  openDirectoryDialog: () => Promise<{
    dirPath: string;
    folderName?: string;
    files: FolderFileEntry[];
    error?: string;
  } | null>;
  openDirectoryPath: (dirPath: string) => Promise<{
    dirPath: string;
    folderName?: string;
    files: FolderFileEntry[];
    error?: string;
  } | null>;
  getPathInfo: (
    filePath: string
  ) => Promise<{ exists: boolean; isDirectory: boolean; isFile: boolean }>;
  getPathForFile: (file: File) => string;
  readFile: (filePath: string) => Promise<FileData>;
  readBinaryFile: (filePath: string) => Promise<BinaryFileData>;
  saveFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>;
  saveBinaryFile: (
    filePath: string,
    base64: string
  ) => Promise<{ success: boolean; error?: string }>;
  saveFileDialog: (defaultName?: string) => Promise<string | null>;
  watchFile: (filePath: string) => Promise<boolean>;
  unwatchFile: () => Promise<boolean>;
  exportPDF: () => Promise<{ success: boolean; path?: string; canceled?: boolean; error?: string }>;
  exportHTML: (
    defaultName: string,
    htmlContent: string
  ) => Promise<{ success: boolean; path?: string; canceled?: boolean; error?: string }>;
  getInitialFiles: () => Promise<string[]>;
  showInFolder: (filePath: string) => Promise<boolean>;
  openExternal: (url: string) => Promise<void>;

  // Listeners
  onFileOpenedFromCLI: (callback: (filePath: string) => void) => () => void;
  onFilesOpenedFromCLI: (callback: (filePaths: string[]) => void) => () => void;
  onFileChangedOnDisk: (callback: (filePath: string) => void) => () => void;
}

const api: ElectronAPI = {
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  close: () => ipcRenderer.invoke('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  onWindowStateChanged: (callback) => {
    const subscription = (_event: any, data: { isMaximized: boolean }) =>
      callback(data.isMaximized);
    ipcRenderer.on('window:state-changed', subscription);
    return () => ipcRenderer.removeListener('window:state-changed', subscription);
  },

  openFileDialog: () => ipcRenderer.invoke('file:open-dialog'),
  openDirectoryDialog: () => ipcRenderer.invoke('file:open-directory-dialog'),
  openDirectoryPath: (dirPath: string) => ipcRenderer.invoke('file:open-directory-path', dirPath),
  getPathInfo: (filePath: string) => ipcRenderer.invoke('file:get-path-info', filePath),
  getPathForFile: (file: File) => {
    try {
      return webUtils.getPathForFile(file);
    } catch {
      return (file as any).path || '';
    }
  },
  readFile: (filePath: string) => ipcRenderer.invoke('file:read', filePath),
  readBinaryFile: (filePath: string) => ipcRenderer.invoke('file:read-binary', filePath),
  saveFile: (filePath: string, content: string) =>
    ipcRenderer.invoke('file:save', filePath, content),
  saveBinaryFile: (filePath: string, base64: string) =>
    ipcRenderer.invoke('file:save-binary', filePath, base64),
  saveFileDialog: (defaultName?: string) => ipcRenderer.invoke('file:save-dialog', defaultName),
  watchFile: (filePath: string) => ipcRenderer.invoke('file:watch', filePath),
  unwatchFile: () => ipcRenderer.invoke('file:unwatch'),
  exportPDF: () => ipcRenderer.invoke('file:export-pdf'),
  exportHTML: (defaultName: string, htmlContent: string) =>
    ipcRenderer.invoke('file:export-html', defaultName, htmlContent),
  getInitialFiles: () => ipcRenderer.invoke('file:get-initial-files'),
  showInFolder: (filePath: string) => ipcRenderer.invoke('shell:show-in-folder', filePath),
  openExternal: (url: string) => ipcRenderer.invoke('shell:open-external', url),

  onFileOpenedFromCLI: (callback) => {
    const subscription = (_event: any, filePath: string) => callback(filePath);
    ipcRenderer.on('file:opened-from-cli', subscription);
    return () => ipcRenderer.removeListener('file:opened-from-cli', subscription);
  },
  onFilesOpenedFromCLI: (callback) => {
    const subscription = (_event: any, filePaths: string[]) => callback(filePaths);
    ipcRenderer.on('file:opened-multiple-from-cli', subscription);
    return () => ipcRenderer.removeListener('file:opened-multiple-from-cli', subscription);
  },
  onFileChangedOnDisk: (callback) => {
    const subscription = (_event: any, filePath: string) => callback(filePath);
    ipcRenderer.on('file:changed-on-disk', subscription);
    return () => ipcRenderer.removeListener('file:changed-on-disk', subscription);
  },
};

contextBridge.exposeInMainWorld('api', api);

declare global {
  interface Window {
    api: ElectronAPI;
  }
}
