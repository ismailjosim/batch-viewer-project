import React, { useState } from "react";
import { Folder, FolderOpen, ListTree, ChevronLeft } from "lucide-react";
import { WorkspaceFolder, RecentDocument } from "../types";
import { SidebarFiles } from "./sidebar/SidebarFiles";
import { SidebarOutline } from "./sidebar/SidebarOutline";

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
  const [activeTab, setActiveTab] = useState<"files" | "outline">(
    workspaceFolder ? "files" : "outline",
  );

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        title="Open Sidebar (Explorer & Outline)"
        className="fixed bottom-4 left-4 p-2.5 rounded-full bg-fluent-card-light dark:bg-fluent-card-dark border border-fluent-border-light dark:border-fluent-border-dark shadow-xl hover:bg-black/5 dark:hover:bg-white/10 z-40 transition-transform hover:scale-105 text-fluent-accent"
      >
        <Folder className="w-4 h-4" />
      </button>
    );
  }

  return (
    <aside className="w-64 h-full flex flex-col border-r border-fluent-border-light dark:border-fluent-border-dark bg-fluent-card-light/60 dark:bg-fluent-card-dark/60 backdrop-blur-md select-none shrink-0 transition-all duration-200">
      {/* Top Header & Tab Navigation */}
      <div className="flex items-center justify-between p-2 border-b border-fluent-border-light dark:border-fluent-border-dark bg-black/5 dark:bg-black/20">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("files")}
            className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === "files"
                ? "bg-fluent-card-light dark:bg-fluent-card-dark text-fluent-accent shadow-sm border border-fluent-border-light dark:border-fluent-border-dark"
                : "text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Files</span>
            {workspaceFolder && (
              <span className="text-[10px] px-1 py-0.2 rounded-full bg-black/10 dark:bg-white/10">
                {workspaceFolder.files.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("outline")}
            className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === "outline"
                ? "bg-fluent-card-light dark:bg-fluent-card-dark text-fluent-accent shadow-sm border border-fluent-border-light dark:border-fluent-border-dark"
                : "text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <ListTree className="w-3.5 h-3.5" />
            <span>Outline</span>
          </button>
        </div>

        <button
          onClick={onToggle}
          title="Collapse Sidebar"
          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Dynamic Content */}
      {activeTab === "files" ? (
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
