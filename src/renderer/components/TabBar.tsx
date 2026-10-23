import React, { useState, useEffect } from 'react';
import { DocumentTab, DocumentType } from '../types';
import { FileText, FileCode, Plus, X, Home, Copy, ExternalLink, ShieldAlert } from 'lucide-react';

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
        return <span className="text-[10px] font-bold px-1 py-0.2 bg-red-500/20 text-red-500 rounded">PDF</span>;
      case 'word':
        return <span className="text-[10px] font-bold px-1 py-0.2 bg-blue-500/20 text-blue-500 rounded">DOCX</span>;
      case 'text':
        return <FileCode className="w-3.5 h-3.5 text-emerald-400" />;
      case 'markdown':
      default:
        return <FileText className="w-3.5 h-3.5 text-fluent-accent" />;
    }
  };

  const copyPath = (path: string | null) => {
    if (path) {
      navigator.clipboard.writeText(path);
    }
  };

  return (
    <div className="h-9 w-full flex items-center bg-black/5 dark:bg-black/20 border-b border-fluent-border-light dark:border-fluent-border-dark select-none text-xs px-2 overflow-x-auto scrollbar-none gap-1 app-region-no-drag relative">
      <div className="flex items-center gap-1 flex-1 overflow-x-auto scrollbar-none">
        {/* Overview Button */}
        <button
          onClick={onShowOverview}
          title="Overview & Recent Documents"
          className={`h-7 px-2.5 flex items-center gap-1.5 rounded-t-md cursor-pointer transition-all border-t-2 shrink-0 ${
            activeTabId === 'overview'
              ? 'bg-fluent-card-light dark:bg-fluent-card-dark border-fluent-accent shadow-sm font-semibold text-fluent-accent'
              : 'border-transparent opacity-75 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark'
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span className="text-xs">Overview</span>
        </button>

        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              onContextMenu={(e) => handleContextMenu(e, tab)}
              className={`group relative h-7 max-w-[190px] min-w-[110px] px-2.5 flex items-center justify-between rounded-t-md cursor-pointer transition-all border-t-2 ${
                isActive
                  ? 'bg-fluent-card-light dark:bg-fluent-card-dark border-fluent-accent shadow-sm font-medium text-fluent-text-primaryLight dark:text-fluent-text-primaryDark'
                  : 'border-transparent opacity-75 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark'
              }`}
            >
              <div className="flex items-center gap-2 truncate mr-1">
                {getTabIcon(tab.fileType)}
                <span className="truncate text-xs">{tab.fileName}</span>
                {tab.isDirty && (
                  <span className="w-1.5 h-1.5 rounded-full bg-fluent-accent shrink-0" title="Unsaved changes" />
                )}
              </div>

              <button
                onClick={(e) => onCloseTab(tab.id, e)}
                title="Close Tab (Ctrl+W)"
                className="w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/20 transition-opacity shrink-0"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}

        <button
          onClick={onNewTab}
          title="New Document (Ctrl+N)"
          className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors ml-1 text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark hover:text-fluent-accent"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Floating Tab Context Menu */}
      {contextMenu && (
        <div
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="fixed z-50 min-w-[175px] bg-fluent-card-light dark:bg-fluent-card-dark border border-fluent-border-light dark:border-fluent-border-dark rounded-xl shadow-2xl p-1.5 text-xs text-fluent-text-primaryLight dark:text-fluent-text-primaryDark animate-in fade-in zoom-in-95 backdrop-blur-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-2 py-1 text-[10px] font-semibold text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark truncate border-b border-fluent-border-light dark:border-fluent-border-dark mb-1">
            {contextMenu.tab.fileName}
          </div>

          <button
            onClick={() => {
              onCloseTab(contextMenu.tab.id);
              setContextMenu(null);
            }}
            className="w-full text-left px-2 py-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-between"
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
              className="w-full text-left px-2 py-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10"
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
              className="w-full text-left px-2 py-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10"
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
              className="w-full text-left px-2 py-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10"
            >
              Close All
            </button>
          )}

          <div className="h-[1px] bg-fluent-border-light dark:border-fluent-border-dark my-1" />

          {contextMenu.tab.filePath && (
            <>
              <button
                onClick={() => {
                  copyPath(contextMenu.tab.filePath);
                  setContextMenu(null);
                }}
                className="w-full text-left px-2 py-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5 opacity-70" />
                <span>Copy Path</span>
              </button>

              {onRevealInFolder && (
                <button
                  onClick={() => {
                    onRevealInFolder(contextMenu.tab.filePath!);
                    setContextMenu(null);
                  }}
                  className="w-full text-left px-2 py-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
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
