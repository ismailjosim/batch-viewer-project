import React, { useState, useEffect } from 'react';
import {
  Sun,
  Moon,
  Minus,
  Square,
  Copy,
  X,
  FolderOpen,
  Save,
  FilePlus,
  Eye,
  Columns,
  Edit3,
} from 'lucide-react';
import { DocumentType } from '../types';
import appLogo from '../assets/logo.png';

interface TitleBarProps {
  fileName: string | null;
  fileType?: DocumentType;
  isDirty: boolean;
  theme: 'light' | 'dark';
  viewMode: 'view' | 'split' | 'edit';
  onToggleTheme: () => void;
  onOpenFile: () => void;
  onSaveFile: () => void;
  onNewFile: () => void;
  onViewModeChange: (mode: 'view' | 'split' | 'edit') => void;
  onGoHome?: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  fileName,
  fileType,
  isDirty,
  theme,
  viewMode,
  onToggleTheme,
  onOpenFile,
  onSaveFile,
  onNewFile,
  onViewModeChange,
  onGoHome,
}) => {
  const [isMaximized, setIsMaximized] = useState<boolean>(false);

  useEffect(() => {
    if (window.api) {
      window.api.isMaximized().then(setIsMaximized);
      const unsubscribe = window.api.onWindowStateChanged(setIsMaximized);
      return () => unsubscribe();
    }
  }, []);

  const handleMinimize = () => window.api?.minimize();
  const handleMaximize = async () => {
    const max = await window.api?.maximize();
    setIsMaximized(!!max);
  };
  const handleClose = () => window.api?.close();

  return (
    <div className="app-region-drag z-50 flex h-10 w-full select-none items-center justify-between border-b border-fluent-border-light bg-fluent-card-light/80 text-xs backdrop-blur-md dark:border-fluent-border-dark dark:bg-fluent-card-dark/80">
      {/* Left: App icon & File actions */}
      <div className="app-region-no-drag flex items-center gap-1 px-3">
        <div
          onClick={onGoHome}
          title="Overview & Recent Documents"
          className="mr-3 flex cursor-pointer items-center gap-2 font-semibold text-fluent-accent transition-opacity hover:opacity-80"
        >
          <img src={appLogo} alt="Batch-Viewer" className="h-4 w-4 rounded-full object-contain" />
          <span className="hidden sm:inline">Batch-Viewer</span>
        </div>

        <button
          onClick={onNewFile}
          title="New Document (Ctrl+N)"
          className="rounded p-1.5 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
        >
          <FilePlus className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={onOpenFile}
          title="Open Document(s) (Ctrl+O)"
          className="rounded p-1.5 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
        >
          <FolderOpen className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={onSaveFile}
          title="Save File (Ctrl+S)"
          className="rounded p-1.5 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
        >
          <Save className="h-3.5 w-3.5" />
        </button>

        {/* View mode toggle - shown for Markdown */}
        {fileType === 'markdown' && (
          <div className="ml-2 flex items-center rounded border border-fluent-border-light bg-black/5 p-0.5 dark:border-fluent-border-dark dark:bg-white/5">
            <button
              onClick={() => onViewModeChange('view')}
              title="Read / View Mode"
              className={`flex items-center gap-1 rounded px-2 py-1 transition-all ${
                viewMode === 'view'
                  ? 'bg-fluent-accent text-white shadow-sm'
                  : 'hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              <Eye className="h-3 w-3" />
              <span className="hidden text-[11px] md:inline">View</span>
            </button>
            <button
              onClick={() => onViewModeChange('split')}
              title="Split View"
              className={`flex items-center gap-1 rounded px-2 py-1 transition-all ${
                viewMode === 'split'
                  ? 'bg-fluent-accent text-white shadow-sm'
                  : 'hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              <Columns className="h-3 w-3" />
              <span className="hidden text-[11px] md:inline">Split</span>
            </button>
            <button
              onClick={() => onViewModeChange('edit')}
              title="Edit Mode"
              className={`flex items-center gap-1 rounded px-2 py-1 transition-all ${
                viewMode === 'edit'
                  ? 'bg-fluent-accent text-white shadow-sm'
                  : 'hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              <Edit3 className="h-3 w-3" />
              <span className="hidden text-[11px] md:inline">Edit</span>
            </button>
          </div>
        )}
      </div>

      {/* Center: File Title */}
      <div className="pointer-events-none max-w-[40%] truncate text-center font-medium opacity-80">
        {fileName || 'Untitled'} {isDirty ? '•' : ''}
      </div>

      {/* Right: Theme switch & Windows 11 Titlebar controls */}
      <div className="app-region-no-drag flex h-full items-center">
        <button
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="mr-1 rounded p-2 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
        >
          {theme === 'dark' ? (
            <Sun className="h-3.5 w-3.5 text-amber-400" />
          ) : (
            <Moon className="h-3.5 w-3.5" />
          )}
        </button>

        <button
          onClick={handleMinimize}
          className="flex h-full w-11 items-center justify-center transition-colors hover:bg-black/5 dark:hover:bg-white/10"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={handleMaximize}
          className="flex h-full w-11 items-center justify-center transition-colors hover:bg-black/5 dark:hover:bg-white/10"
        >
          {isMaximized ? <Copy className="h-3 w-3 rotate-180" /> : <Square className="h-3 w-3" />}
        </button>
        <button
          onClick={handleClose}
          className="flex h-full w-11 items-center justify-center transition-colors hover:bg-[#e81123] hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
