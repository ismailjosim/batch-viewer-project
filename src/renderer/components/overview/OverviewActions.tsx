import React from 'react';
import { FolderOpen, FolderTree, FilePlus, ArrowUpRight } from 'lucide-react';

interface OverviewActionsProps {
  onOpenFile: () => void;
  onOpenFolder: () => void;
  onNewDocument: () => void;
}

export const OverviewActions: React.FC<OverviewActionsProps> = ({
  onOpenFile,
  onOpenFolder,
  onNewDocument,
}) => {
  return (
    <div className="grid select-none grid-cols-1 gap-4 md:grid-cols-3">
      {/* 1. Open File */}
      <button
        onClick={onOpenFile}
        className="group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-fluent-border-light bg-fluent-card-light/90 p-5 text-left shadow-md transition-all hover:border-fluent-accent/50 hover:shadow-xl dark:border-fluent-border-dark dark:bg-fluent-card-dark/90"
      >
        <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-bl from-fluent-accent/10 to-transparent transition-transform group-hover:scale-110" />
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-fluent-accent/10 text-fluent-accent transition-transform group-hover:scale-110">
          <FolderOpen className="h-5 w-5" />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm font-semibold">Open File</span>
            <ArrowUpRight className="h-4 w-4 text-fluent-accent opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <p className="text-xs text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark">
            Open Markdown, PDF, Word, or plain text document
          </p>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-fluent-border-light pt-3 font-mono text-[11px] text-fluent-text-secondaryLight dark:border-fluent-border-dark dark:text-fluent-text-secondaryDark">
          <span>Single or multi file</span>
          <span className="rounded bg-black/5 px-1.5 py-0.5 dark:bg-white/5">Ctrl + O</span>
        </div>
      </button>

      {/* 2. Open Folder */}
      <button
        onClick={onOpenFolder}
        className="group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-fluent-border-light bg-fluent-card-light/90 p-5 text-left shadow-md transition-all hover:border-blue-500/50 hover:shadow-xl dark:border-fluent-border-dark dark:bg-fluent-card-dark/90"
      >
        <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-bl from-blue-500/10 to-transparent transition-transform group-hover:scale-110" />
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 transition-transform group-hover:scale-110">
          <FolderTree className="h-5 w-5" />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm font-semibold">Open Folder</span>
            <ArrowUpRight className="h-4 w-4 text-blue-500 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <p className="text-xs text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark">
            Scan and browse all documents in a directory
          </p>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-fluent-border-light pt-3 font-mono text-[11px] text-fluent-text-secondaryLight dark:border-fluent-border-dark dark:text-fluent-text-secondaryDark">
          <span>Folder Workspace</span>
          <span className="rounded bg-black/5 px-1.5 py-0.5 dark:bg-white/5">Directory</span>
        </div>
      </button>

      {/* 3. New Document */}
      <button
        onClick={onNewDocument}
        className="group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-fluent-border-light bg-fluent-card-light/90 p-5 text-left shadow-md transition-all hover:border-purple-500/50 hover:shadow-xl dark:border-fluent-border-dark dark:bg-fluent-card-dark/90"
      >
        <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-bl from-purple-500/10 to-transparent transition-transform group-hover:scale-110" />
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 transition-transform group-hover:scale-110">
          <FilePlus className="h-5 w-5" />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm font-semibold">New Document</span>
            <ArrowUpRight className="h-4 w-4 text-purple-400 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <p className="text-xs text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark">
            Create an empty Markdown scratchpad or document
          </p>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-fluent-border-light pt-3 font-mono text-[11px] text-fluent-text-secondaryLight dark:border-fluent-border-dark dark:text-fluent-text-secondaryDark">
          <span>Instant tab</span>
          <span className="rounded bg-black/5 px-1.5 py-0.5 dark:bg-white/5">Ctrl + N</span>
        </div>
      </button>
    </div>
  );
};
