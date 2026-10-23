import React from "react";
import { FolderOpen, FolderTree, FilePlus, ArrowUpRight } from "lucide-react";

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 select-none">
      {/* 1. Open File */}
      <button
        onClick={onOpenFile}
        className="group relative p-5 rounded-2xl bg-fluent-card-light/90 dark:bg-fluent-card-dark/90 border border-fluent-border-light dark:border-fluent-border-dark hover:border-fluent-accent/50 shadow-md hover:shadow-xl transition-all text-left flex flex-col justify-between overflow-hidden cursor-pointer"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-fluent-accent/10 to-transparent rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
        <div className="w-10 h-10 rounded-xl bg-fluent-accent/10 text-fluent-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <FolderOpen className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-sm">Open File</span>
            <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-fluent-accent" />
          </div>
          <p className="text-xs text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark">
            Open Markdown, PDF, Word, or plain text document
          </p>
        </div>
        <div className="mt-3 pt-3 border-t border-fluent-border-light dark:border-fluent-border-dark flex items-center justify-between text-[11px] text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark font-mono">
          <span>Single or multi file</span>
          <span className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5">
            Ctrl + O
          </span>
        </div>
      </button>

      {/* 2. Open Folder */}
      <button
        onClick={onOpenFolder}
        className="group relative p-5 rounded-2xl bg-fluent-card-light/90 dark:bg-fluent-card-dark/90 border border-fluent-border-light dark:border-fluent-border-dark hover:border-blue-500/50 shadow-md hover:shadow-xl transition-all text-left flex flex-col justify-between overflow-hidden cursor-pointer"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <FolderTree className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-sm">Open Folder</span>
            <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
          </div>
          <p className="text-xs text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark">
            Scan and browse all documents in a directory
          </p>
        </div>
        <div className="mt-3 pt-3 border-t border-fluent-border-light dark:border-fluent-border-dark flex items-center justify-between text-[11px] text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark font-mono">
          <span>Folder Workspace</span>
          <span className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5">
            Directory
          </span>
        </div>
      </button>

      {/* 3. New Document */}
      <button
        onClick={onNewDocument}
        className="group relative p-5 rounded-2xl bg-fluent-card-light/90 dark:bg-fluent-card-dark/90 border border-fluent-border-light dark:border-fluent-border-dark hover:border-purple-500/50 shadow-md hover:shadow-xl transition-all text-left flex flex-col justify-between overflow-hidden cursor-pointer"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <FilePlus className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-sm">New Document</span>
            <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-purple-400" />
          </div>
          <p className="text-xs text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark">
            Create an empty Markdown scratchpad or document
          </p>
        </div>
        <div className="mt-3 pt-3 border-t border-fluent-border-light dark:border-fluent-border-dark flex items-center justify-between text-[11px] text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark font-mono">
          <span>Instant tab</span>
          <span className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5">
            Ctrl + N
          </span>
        </div>
      </button>
    </div>
  );
};
