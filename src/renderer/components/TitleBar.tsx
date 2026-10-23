import React, { useState, useEffect } from 'react';
import {
  FileText,
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
  Edit3
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
    <div className="h-10 w-full flex items-center justify-between bg-fluent-card-light/80 dark:bg-fluent-card-dark/80 backdrop-blur-md border-b border-fluent-border-light dark:border-fluent-border-dark select-none z-50 text-xs app-region-drag">
      {/* Left: App icon & File actions */}
      <div className="flex items-center gap-1 px-3 app-region-no-drag">
        <div
          onClick={onGoHome}
          title="Overview & Recent Documents"
          className="flex items-center gap-2 mr-3 font-semibold text-fluent-accent cursor-pointer hover:opacity-80 transition-opacity"
        >
          <img src={appLogo} alt="Batch-Viewer" className="w-4 h-4 rounded-full object-contain" />
          <span className="hidden sm:inline">Batch-Viewer</span>
        </div>

        <button
          onClick={onNewFile}
          title="New Document (Ctrl+N)"
          className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <FilePlus className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onOpenFile}
          title="Open Document(s) (Ctrl+O)"
          className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <FolderOpen className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onSaveFile}
          title="Save File (Ctrl+S)"
          className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
        </button>

        {/* View mode toggle - shown for Markdown */}
        {fileType === 'markdown' && (
          <div className="flex items-center bg-black/5 dark:bg-white/5 rounded p-0.5 ml-2 border border-fluent-border-light dark:border-fluent-border-dark">
            <button
              onClick={() => onViewModeChange('view')}
              title="Read / View Mode"
              className={`px-2 py-1 rounded flex items-center gap-1 transition-all ${
                viewMode === 'view' ? 'bg-fluent-accent text-white shadow-sm' : 'hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span className="hidden md:inline text-[11px]">View</span>
            </button>
            <button
              onClick={() => onViewModeChange('split')}
              title="Split View"
              className={`px-2 py-1 rounded flex items-center gap-1 transition-all ${
                viewMode === 'split' ? 'bg-fluent-accent text-white shadow-sm' : 'hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              <Columns className="w-3 h-3" />
              <span className="hidden md:inline text-[11px]">Split</span>
            </button>
            <button
              onClick={() => onViewModeChange('edit')}
              title="Edit Mode"
              className={`px-2 py-1 rounded flex items-center gap-1 transition-all ${
                viewMode === 'edit' ? 'bg-fluent-accent text-white shadow-sm' : 'hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              <Edit3 className="w-3 h-3" />
              <span className="hidden md:inline text-[11px]">Edit</span>
            </button>
          </div>
        )}
      </div>

      {/* Center: File Title */}
      <div className="truncate max-w-[40%] text-center font-medium opacity-80 pointer-events-none">
        {fileName || 'Untitled'} {isDirty ? '•' : ''}
      </div>

      {/* Right: Theme switch & Windows 11 Titlebar controls */}
      <div className="flex items-center app-region-no-drag h-full">
        <button
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 mr-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={handleMinimize}
          className="w-11 h-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleMaximize}
          className="w-11 h-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          {isMaximized ? <Copy className="w-3 h-3 rotate-180" /> : <Square className="w-3 h-3" />}
        </button>
        <button
          onClick={handleClose}
          className="w-11 h-full flex items-center justify-center hover:bg-[#e81123] hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
