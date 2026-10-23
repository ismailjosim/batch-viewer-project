import React, { useState } from 'react';
import { Folder, FolderOpen, ListTree, ChevronLeft } from 'lucide-react';
import { WorkspaceFolder, RecentDocument } from '../types';
import { SidebarFiles } from './sidebar/SidebarFiles';
import { SidebarOutline } from './sidebar/SidebarOutline';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  // Outline Props
  content: string;
  isMarkdown: boolean;
  onSelectHeading: (id: string) => void;
  // Workspace / Files Props
  workspaceFolder: WorkspaceFolder | null;
  activeFilePath: string | null;
  recentFiles: RecentDocument[];
  onOpenFileFromPath: (path: string) => void;
  onOpenFolderDialog: () => void;
  onRevealInFolder: (path: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  content,
  isMarkdown,
  onSelectHeading,
  workspaceFolder,
  activeFilePath,
  recentFiles,
  onOpenFileFromPath,
  onOpenFolderDialog,
  onRevealInFolder,
}) => {
  const [activeTab, setActiveTab] = useState<'files' | 'outline'>(
    workspaceFolder ? 'files' : 'outline'
  );

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        title="Open Sidebar (Explorer & Outline)"
        className="fixed bottom-4 left-4 z-40 rounded-full border border-fluent-border-light bg-fluent-card-light p-2.5 text-fluent-accent shadow-xl transition-transform hover:scale-105 hover:bg-black/5 dark:border-fluent-border-dark dark:bg-fluent-card-dark dark:hover:bg-white/10"
      >
        <Folder className="h-4 w-4" />
      </button>
    );
  }

  return (
    <aside className="flex h-full w-64 shrink-0 select-none flex-col border-r border-fluent-border-light bg-fluent-card-light/60 backdrop-blur-md transition-all duration-200 dark:border-fluent-border-dark dark:bg-fluent-card-dark/60">
      {/* Top Header & Tab Navigation */}
      <div className="flex items-center justify-between border-b border-fluent-border-light bg-black/5 p-2 dark:border-fluent-border-dark dark:bg-black/20">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('files')}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              activeTab === 'files'
                ? 'border border-fluent-border-light bg-fluent-card-light text-fluent-accent shadow-sm dark:border-fluent-border-dark dark:bg-fluent-card-dark'
                : 'text-fluent-text-secondaryLight hover:bg-black/5 dark:text-fluent-text-secondaryDark dark:hover:bg-white/5'
            }`}
          >
            <FolderOpen className="h-3.5 w-3.5" />
            <span>Files</span>
            {workspaceFolder && (
              <span className="py-0.2 rounded-full bg-black/10 px-1 text-[10px] dark:bg-white/10">
                {workspaceFolder.files.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('outline')}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              activeTab === 'outline'
                ? 'border border-fluent-border-light bg-fluent-card-light text-fluent-accent shadow-sm dark:border-fluent-border-dark dark:bg-fluent-card-dark'
                : 'text-fluent-text-secondaryLight hover:bg-black/5 dark:text-fluent-text-secondaryDark dark:hover:bg-white/5'
            }`}
          >
            <ListTree className="h-3.5 w-3.5" />
            <span>Outline</span>
          </button>
        </div>

        <button
          onClick={onToggle}
          title="Collapse Sidebar"
          className="rounded p-1 text-fluent-text-secondaryLight transition-colors hover:bg-black/5 dark:text-fluent-text-secondaryDark dark:hover:bg-white/10"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Dynamic Content */}
      {activeTab === 'files' ? (
        <SidebarFiles
          workspaceFolder={workspaceFolder}
          activeFilePath={activeFilePath}
          recentFiles={recentFiles}
          onOpenFileFromPath={onOpenFileFromPath}
          onOpenFolderDialog={onOpenFolderDialog}
          onRevealInFolder={onRevealInFolder}
        />
      ) : (
        <SidebarOutline
          content={content}
          isMarkdown={isMarkdown}
          onSelectHeading={onSelectHeading}
        />
      )}
    </aside>
  );
};
