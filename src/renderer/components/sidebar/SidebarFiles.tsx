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
          <span className="py-0.2 shrink-0 rounded border border-red-500/25 bg-red-500/15 px-1 text-[9px] font-bold uppercase tracking-wider text-red-500">
            PDF
          </span>
        );
      case 'word':
        return (
          <span className="py-0.2 shrink-0 rounded border border-blue-500/25 bg-blue-500/15 px-1 text-[9px] font-bold uppercase tracking-wider text-blue-500">
            DOCX
          </span>
        );
      case 'text':
        return (
          <span className="py-0.2 shrink-0 rounded border border-emerald-500/25 bg-emerald-500/15 px-1 text-[9px] font-bold uppercase tracking-wider text-emerald-400">
            TXT
          </span>
        );
      case 'markdown':
      default:
        return (
          <span className="py-0.2 shrink-0 rounded border border-purple-500/25 bg-purple-500/15 px-1 text-[9px] font-bold uppercase tracking-wider text-purple-400">
            MD
          </span>
        );
    }
  };

  if (!workspaceFolder) {
    return (
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-3">
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-fluent-border-light bg-black/5 p-3 text-center dark:border-fluent-border-dark dark:bg-white/5">
          <FolderOpen className="h-7 w-7 text-fluent-accent opacity-80" />
          <p className="text-xs font-semibold">No Folder Opened</p>
          <p className="text-[11px] text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark">
            Open a folder to browse all markdown, pdf, word, and text docs in one place.
          </p>
          <button
            onClick={onOpenFolderDialog}
            className="mt-1 rounded-lg bg-fluent-accent px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all hover:opacity-90"
          >
            Open Folder
          </button>
        </div>

        {recentFiles.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark">
              <Clock className="h-3 w-3 text-fluent-accent" />
              <span>Recent Files</span>
            </div>
            <div className="space-y-1">
              {recentFiles.slice(0, 10).map((rf) => (
                <div
                  key={rf.filePath}
                  onClick={() => onOpenFileFromPath(rf.filePath)}
                  className="flex cursor-pointer items-center justify-between truncate rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                  title={rf.filePath}
                >
                  <div className="mr-1 flex items-center gap-2 truncate">
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
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Folder Header */}
      <div className="flex items-center justify-between border-b border-fluent-border-light bg-black/5 px-3 py-2 dark:border-fluent-border-dark dark:bg-white/5">
        <div className="mr-2 truncate">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-fluent-accent">
            Workspace
          </span>
          <span className="block truncate text-xs font-bold" title={workspaceFolder.dirPath}>
            {workspaceFolder.folderName}
          </span>
        </div>
        <button
          onClick={onOpenFolderDialog}
          title="Switch Folder"
          className="shrink-0 text-[11px] text-fluent-accent hover:underline"
        >
          Change
        </button>
      </div>

      {/* Filter Search */}
      <div className="border-b border-fluent-border-light p-2 dark:border-fluent-border-dark">
        <div className="relative flex items-center">
          <Search className="pointer-events-none absolute left-2 h-3.5 w-3.5 text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark" />
          <input
            type="text"
            value={fileFilter}
            onChange={(e) => setFileFilter(e.target.value)}
            placeholder="Filter files..."
            className="w-full rounded border border-fluent-border-light bg-black/5 py-1 pl-7 pr-2 text-xs outline-none focus:border-fluent-accent dark:border-fluent-border-dark dark:bg-white/5"
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
      <div className="flex-1 space-y-0.5 overflow-y-auto p-1.5">
        {filteredFiles.length === 0 ? (
          <div className="py-6 text-center text-xs text-fluent-text-secondaryLight opacity-60 dark:text-fluent-text-secondaryDark">
            No matching files
          </div>
        ) : (
          filteredFiles.map((f) => {
            const isActive =
              activeFilePath && activeFilePath.toLowerCase() === f.path.toLowerCase();
            return (
              <div
                key={f.path}
                onClick={() => onOpenFileFromPath(f.path)}
                className={`group flex w-full cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors ${
                  isActive
                    ? 'bg-fluent-accent/15 font-medium text-fluent-accent'
                    : 'text-fluent-text-primaryLight hover:bg-black/5 dark:text-fluent-text-primaryDark dark:hover:bg-white/5'
                }`}
                title={f.path}
              >
                <div className="mr-1 flex items-center gap-2 truncate">
                  {getFormatBadge(f.fileType)}
                  <span className="truncate">{f.name}</span>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {f.size > 0 && (
                    <span className="text-[10px] text-fluent-text-secondaryLight opacity-60 dark:text-fluent-text-secondaryDark">
                      {formatFileSize(f.size)}
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRevealInFolder(f.path);
                    }}
                    title="Reveal in File Explorer"
                    className="rounded p-0.5 opacity-0 transition-opacity hover:bg-black/10 group-hover:opacity-100 dark:hover:bg-white/10"
                  >
                    <ExternalLink className="h-3 w-3 text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark" />
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
