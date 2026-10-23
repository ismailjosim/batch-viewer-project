import React, { useState, useEffect } from 'react';
import { DocumentTab, DocumentType } from '../types';
import { FileText, FileCode, Plus, X, Home, Copy, ExternalLink } from 'lucide-react';

interface TabBarProps {
  tabs: DocumentTab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string, e?: React.MouseEvent) => void;
  onCloseOtherTabs?: (id: string) => void;
  onCloseTabsToRight?: (id: string) => void;
  onCloseAllTabs?: () => void;
  onNewTab: () => void;
  onShowOverview: () => void;
  onRevealInFolder?: (filePath: string) => void;
}

interface ContextMenuState {
  x: number;
  y: number;
  tab: DocumentTab;
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onCloseOtherTabs,
  onCloseTabsToRight,
  onCloseAllTabs,
  onNewTab,
  onShowOverview,
  onRevealInFolder,
}) => {
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  // Close context menu on click anywhere outside or on escape
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContextMenu(null);
    };
    window.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleContextMenu = (e: React.MouseEvent, tab: DocumentTab) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: Math.min(e.clientX, window.innerWidth - 180),
      y: e.clientY,
      tab,
    });
  };

  const getTabIcon = (type: DocumentType) => {
    switch (type) {
      case 'pdf':
        return (
          <span className="py-0.2 rounded bg-red-500/20 px-1 text-[10px] font-bold text-red-500">
            PDF
          </span>
        );
      case 'word':
        return (
          <span className="py-0.2 rounded bg-blue-500/20 px-1 text-[10px] font-bold text-blue-500">
            DOCX
          </span>
        );
      case 'text':
        return <FileCode className="h-3.5 w-3.5 text-emerald-400" />;
      case 'markdown':
      default:
        return <FileText className="h-3.5 w-3.5 text-fluent-accent" />;
    }
  };

  const copyPath = (path: string | null) => {
    if (path) {
      navigator.clipboard.writeText(path);
    }
  };

  return (
    <div className="scrollbar-none app-region-no-drag relative flex h-9 w-full select-none items-center gap-1 overflow-x-auto border-b border-fluent-border-light bg-black/5 px-2 text-xs dark:border-fluent-border-dark dark:bg-black/20">
      <div className="scrollbar-none flex flex-1 items-center gap-1 overflow-x-auto">
        {/* Overview Button */}
        <button
          onClick={onShowOverview}
          title="Overview & Recent Documents"
          className={`flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-t-md border-t-2 px-2.5 transition-all ${
            activeTabId === 'overview'
              ? 'border-fluent-accent bg-fluent-card-light font-semibold text-fluent-accent shadow-sm dark:bg-fluent-card-dark'
              : 'border-transparent text-fluent-text-secondaryLight opacity-75 hover:bg-black/5 hover:opacity-100 dark:text-fluent-text-secondaryDark dark:hover:bg-white/5'
          }`}
        >
          <Home className="h-3.5 w-3.5" />
          <span className="text-xs">Overview</span>
        </button>

        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              onContextMenu={(e) => handleContextMenu(e, tab)}
              className={`group relative flex h-7 min-w-[110px] max-w-[190px] cursor-pointer items-center justify-between rounded-t-md border-t-2 px-2.5 transition-all ${
                isActive
                  ? 'border-fluent-accent bg-fluent-card-light font-medium text-fluent-text-primaryLight shadow-sm dark:bg-fluent-card-dark dark:text-fluent-text-primaryDark'
                  : 'border-transparent text-fluent-text-secondaryLight opacity-75 hover:bg-black/5 hover:opacity-100 dark:text-fluent-text-secondaryDark dark:hover:bg-white/5'
              }`}
            >
              <div className="mr-1 flex items-center gap-2 truncate">
                {getTabIcon(tab.fileType)}
                <span className="truncate text-xs">{tab.fileName}</span>
                {tab.isDirty && (
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-fluent-accent"
                    title="Unsaved changes"
                  />
                )}
              </div>

              <button
                onClick={(e) => onCloseTab(tab.id, e)}
                title="Close Tab (Ctrl+W)"
                className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full opacity-0 transition-opacity hover:bg-black/10 group-hover:opacity-100 dark:hover:bg-white/20"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          );
        })}

        <button
          onClick={onNewTab}
          title="New Document (Ctrl+N)"
          className="ml-1 rounded-md p-1.5 text-fluent-text-secondaryLight transition-colors hover:bg-black/5 hover:text-fluent-accent dark:text-fluent-text-secondaryDark dark:hover:bg-white/10"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Floating Tab Context Menu */}
      {contextMenu && (
        <div
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="animate-in fade-in zoom-in-95 fixed z-50 min-w-[175px] rounded-xl border border-fluent-border-light bg-fluent-card-light p-1.5 text-xs text-fluent-text-primaryLight shadow-2xl backdrop-blur-md dark:border-fluent-border-dark dark:bg-fluent-card-dark dark:text-fluent-text-primaryDark"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-1 truncate border-b border-fluent-border-light px-2 py-1 text-[10px] font-semibold text-fluent-text-secondaryLight dark:border-fluent-border-dark dark:text-fluent-text-secondaryDark">
            {contextMenu.tab.fileName}
          </div>

          <button
            onClick={() => {
              onCloseTab(contextMenu.tab.id);
              setContextMenu(null);
            }}
            className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left hover:bg-black/5 dark:hover:bg-white/10"
          >
            <span>Close</span>
            <span className="text-[10px] opacity-50">Ctrl+W</span>
          </button>

          {onCloseOtherTabs && tabs.length > 1 && (
            <button
              onClick={() => {
                onCloseOtherTabs(contextMenu.tab.id);
                setContextMenu(null);
              }}
              className="w-full rounded-md px-2 py-1.5 text-left hover:bg-black/5 dark:hover:bg-white/10"
            >
              Close Others
            </button>
          )}

          {onCloseTabsToRight && (
            <button
              onClick={() => {
                onCloseTabsToRight(contextMenu.tab.id);
                setContextMenu(null);
              }}
              className="w-full rounded-md px-2 py-1.5 text-left hover:bg-black/5 dark:hover:bg-white/10"
            >
              Close to the Right
            </button>
          )}

          {onCloseAllTabs && (
            <button
              onClick={() => {
                onCloseAllTabs();
                setContextMenu(null);
              }}
              className="w-full rounded-md px-2 py-1.5 text-left hover:bg-black/5 dark:hover:bg-white/10"
            >
              Close All
            </button>
          )}

          <div className="my-1 h-[1px] bg-fluent-border-light dark:border-fluent-border-dark" />

          {contextMenu.tab.filePath && (
            <>
              <button
                onClick={() => {
                  copyPath(contextMenu.tab.filePath);
                  setContextMenu(null);
                }}
                className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left hover:bg-black/5 dark:hover:bg-white/10"
              >
                <Copy className="h-3.5 w-3.5 opacity-70" />
                <span>Copy Path</span>
              </button>

              {onRevealInFolder && (
                <button
                  onClick={() => {
                    onRevealInFolder(contextMenu.tab.filePath!);
                    setContextMenu(null);
                  }}
                  className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                  <span>Reveal in Explorer</span>
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
