import React, { useMemo, useState } from 'react';
import { FolderOpen, Search, ExternalLink, Clock } from 'lucide-react';
import { WorkspaceFolder, DocumentType, RecentDocument } from '../../types';

interface SidebarFilesProps {
  workspaceFolder: WorkspaceFolder | null;
  activeFilePath: string | null;
  recentFiles: RecentDocument[];
  onOpenFileFromPath: (path: string) => void;
  onOpenFolderDialog: () => void;
  onRevealInFolder: (path: string) => void;
}

export const SidebarFiles: React.FC<SidebarFilesProps> = ({
  workspaceFolder,
  activeFilePath,
  recentFiles,
  onOpenFileFromPath,
  onOpenFolderDialog,
  onRevealInFolder,
}) => {
  const [fileFilter, setFileFilter] = useState('');

  const filteredFiles = useMemo(() => {
    if (!workspaceFolder) return [];
    if (!fileFilter.trim()) return workspaceFolder.files;
    const q = fileFilter.toLowerCase();
    return workspaceFolder.files.filter((f) => f.name.toLowerCase().includes(q));
  }, [workspaceFolder, fileFilter]);

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes <= 0) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFormatBadge = (type: DocumentType) => {
    switch (type) {
      case 'pdf':
        return (
          <span className="px-1 py-0.2 rounded text-[9px] font-bold tracking-wider uppercase bg-red-500/15 text-red-500 border border-red-500/25 shrink-0">
            PDF
          </span>
        );
      case 'word':
        return (
          <span className="px-1 py-0.2 rounded text-[9px] font-bold tracking-wider uppercase bg-blue-500/15 text-blue-500 border border-blue-500/25 shrink-0">
            DOCX
          </span>
        );
      case 'text':
        return (
          <span className="px-1 py-0.2 rounded text-[9px] font-bold tracking-wider uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 shrink-0">
            TXT
          </span>
        );
      case 'markdown':
      default:
        return (
          <span className="px-1 py-0.2 rounded text-[9px] font-bold tracking-wider uppercase bg-purple-500/15 text-purple-400 border border-purple-500/25 shrink-0">
            MD
          </span>
        );
    }
  };

  if (!workspaceFolder) {
    return (
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
        <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-dashed border-fluent-border-light dark:border-fluent-border-dark flex flex-col items-center text-center gap-2">
          <FolderOpen className="w-7 h-7 text-fluent-accent opacity-80" />
          <p className="text-xs font-semibold">No Folder Opened</p>
          <p className="text-[11px] text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark">
            Open a folder to browse all markdown, pdf, word, and text docs in one place.
          </p>
          <button
            onClick={onOpenFolderDialog}
            className="mt-1 px-3 py-1.5 rounded-lg bg-fluent-accent text-white text-xs font-medium hover:opacity-90 shadow-sm transition-all"
          >
            Open Folder
          </button>
        </div>

        {recentFiles.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2 text-[11px] font-semibold tracking-wider uppercase text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark">
              <Clock className="w-3 h-3 text-fluent-accent" />
              <span>Recent Files</span>
            </div>
            <div className="space-y-1">
              {recentFiles.slice(0, 10).map((rf) => (
                <div
                  key={rf.filePath}
                  onClick={() => onOpenFileFromPath(rf.filePath)}
                  className="flex items-center justify-between px-2 py-1.5 rounded-md text-xs hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer truncate transition-colors"
                  title={rf.filePath}
                >
                  <div className="flex items-center gap-2 truncate mr-1">
                    {getFormatBadge(rf.fileType)}
                    <span className="truncate">{rf.fileName}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Folder Header */}
      <div className="px-3 py-2 border-b border-fluent-border-light dark:border-fluent-border-dark flex items-center justify-between bg-black/5 dark:bg-white/5">
        <div className="truncate mr-2">
          <span className="text-[10px] uppercase font-semibold text-fluent-accent tracking-wider block">
            Workspace
          </span>
          <span className="text-xs font-bold truncate block" title={workspaceFolder.dirPath}>
            {workspaceFolder.folderName}
          </span>
        </div>
        <button
          onClick={onOpenFolderDialog}
          title="Switch Folder"
          className="text-[11px] text-fluent-accent hover:underline shrink-0"
        >
          Change
        </button>
      </div>

      {/* Filter Search */}
      <div className="p-2 border-b border-fluent-border-light dark:border-fluent-border-dark">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-2 text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark pointer-events-none" />
          <input
            type="text"
            value={fileFilter}
            onChange={(e) => setFileFilter(e.target.value)}
            placeholder="Filter files..."
            className="w-full text-xs pl-7 pr-2 py-1 rounded bg-black/5 dark:bg-white/5 border border-fluent-border-light dark:border-fluent-border-dark outline-none focus:border-fluent-accent"
          />
          {fileFilter && (
            <button
              onClick={() => setFileFilter('')}
              className="absolute right-2 text-xs opacity-50 hover:opacity-100"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
        {filteredFiles.length === 0 ? (
          <div className="text-center py-6 text-xs text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark opacity-60">
            No matching files
          </div>
        ) : (
          filteredFiles.map((f) => {
            const isActive = activeFilePath && activeFilePath.toLowerCase() === f.path.toLowerCase();
            return (
              <div
                key={f.path}
                onClick={() => onOpenFileFromPath(f.path)}
                className={`group w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-fluent-accent/15 text-fluent-accent font-medium'
                    : 'hover:bg-black/5 dark:hover:bg-white/5 text-fluent-text-primaryLight dark:text-fluent-text-primaryDark'
                }`}
                title={f.path}
              >
                <div className="flex items-center gap-2 truncate mr-1">
                  {getFormatBadge(f.fileType)}
                  <span className="truncate">{f.name}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {f.size > 0 && (
                    <span className="text-[10px] text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark opacity-60">
                      {formatFileSize(f.size)}
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRevealInFolder(f.path);
                    }}
                    title="Reveal in File Explorer"
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-opacity"
                  >
                    <ExternalLink className="w-3 h-3 text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
