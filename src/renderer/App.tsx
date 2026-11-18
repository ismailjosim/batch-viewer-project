import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TitleBar } from './components/TitleBar';
import { TabBar } from './components/TabBar';
import { Sidebar } from './components/Sidebar';
import { DocumentContentArea } from './components/DocumentContentArea';
import { SearchBar } from './components/SearchBar';
import { StatusBar } from './components/StatusBar';
import { DragDropOverlay } from './components/common/DragDropOverlay';
import { ToastNotification } from './components/common/ToastNotification';
import { UpdateNotification } from './components/UpdateNotification';
import { WorkspaceFolder, FolderFileItem, detectFileType } from './types';
import { useRecentFiles } from './hooks/useRecentFiles';
import { useDocumentTabs } from './hooks/useDocumentTabs';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useFileDrop } from './hooks/useFileDrop';
import { exportMarkdownToHtml } from './utils/htmlExport';

export const App: React.FC = () => {
  const { recentFiles, addToRecents, removeRecent, clearRecents } = useRecentFiles();

  const {
    tabs,
    activeTabId,
    activeTab,
    zoom,
    setActiveTabId,
    openFileFromDisk,
    openMultipleFilesFromDisk,
    handleNewTab,
    handleCloseTab,
    handleCloseOtherTabs,
    handleCloseTabsToRight,
    handleCloseAllTabs,
    handleContentChange,
    handleUndoContent,
    handleRedoContent,
    handlePdfAnnotationsChange,
    handlePdfDocumentChange,
    handlePdfSignaturesChange,
    handlePdfRotationChange,
    handleSaveFile,
    handleSavePdf,
    updateZoom,
    resetZoom,
  } = useDocumentTabs({ onAddToRecents: addToRecents });

  const [workspaceFolder, setWorkspaceFolder] = useState<WorkspaceFolder | null>(null);
  const [viewMode, setViewMode] = useState<'view' | 'split' | 'edit'>('view');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [updateToast, setUpdateToast] = useState<string | null>(null);
  const [manualCheckTrigger, setManualCheckTrigger] = useState<number>(0);
  const [externalScrollPct, setExternalScrollPct] = useState<number | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const viewerContainerRef = useRef<HTMLDivElement>(null);
  const isOverviewActive = activeTabId === 'overview' || tabs.length === 0 || !activeTab;

  const dismissToast = useCallback(() => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
    setUpdateToast(null);
  }, []);

  const showToast = useCallback((message: string, duration = 3500) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setUpdateToast(message);
    toastTimeoutRef.current = setTimeout(() => {
      setUpdateToast(null);
      toastTimeoutRef.current = null;
    }, duration);
  }, []);
  const showUpdateToast = useCallback((message: string) => showToast(message, 4000), [showToast]);

  useEffect(
    () => () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    },
    []
  );

  // Toggle theme class on document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Open File Dialog
  const handleOpenFile = async () => {
    if (!window.api) return;
    const paths = await window.api.openFileDialog();
    if (paths && paths.length > 0) {
      openMultipleFilesFromDisk(paths);
    }
  };

  // Open Folder Dialog
  const handleOpenFolder = async () => {
    if (!window.api) return;
    const res = await window.api.openDirectoryDialog();
    if (!res) return;

    if (res.files && res.files.length > 0) {
      const items: FolderFileItem[] = res.files.map((f: any) => {
        const p = typeof f === 'string' ? f : f.path;
        const name = typeof f === 'string' ? f.split(/[\/\\]/).pop() || 'Document' : f.name;
        const size = typeof f === 'object' && f.size ? f.size : 0;
        return { name, path: p, fileType: detectFileType(p), size };
      });

      const folderName = res.folderName || res.dirPath.split(/[\/\\]/).pop() || 'Workspace';
      setWorkspaceFolder({ dirPath: res.dirPath, folderName, files: items });
      setIsSidebarOpen(true);

      if (tabs.length === 0 && items.length > 0) {
        await openFileFromDisk(items[0].path);
      } else {
        showToast(`Opened folder "${folderName}" (${items.length} documents)`, 3000);
      }
    } else {
      showToast('No supported documents found in selected folder', 3000);
    }
  };

  // Split View Proportional Scroll Sync
  const handleEditorScroll = useCallback((pct: number) => {
    if (viewerContainerRef.current) {
      const el = viewerContainerRef.current;
      const maxScroll = el.scrollHeight - el.clientHeight;
      if (maxScroll > 0) el.scrollTop = pct * maxScroll;
    }
  }, []);

  const handleViewerScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const maxScroll = el.scrollHeight - el.clientHeight;
    if (maxScroll > 0) setExternalScrollPct(el.scrollTop / maxScroll);
  }, []);

  // Export to PDF
  const handleExportPDF = async () => {
    if (!window.api) return;
    const result = await window.api.exportPDF();
    if (result.success && result.path) {
      showToast(`Exported to PDF: ${result.path.split(/[\/\\]/).pop()}`);
    }
  };

  // Export to HTML
  const handleExportHTML = async () => {
    if (!activeTab) return;
    const result = await exportMarkdownToHtml(activeTab.fileName);
    if (result.success && result.path) {
      showToast(`Exported HTML: ${result.path.split(/[\/\\]/).pop()}`);
    } else if (result.error) {
      showToast(`Export failed: ${result.error}`);
    }
  };

  const handleOpenFolderFromDrop = useCallback(
    (folder: { dirPath: string; folderName: string; files: FolderFileItem[] }) => {
      setWorkspaceFolder(folder);
      setIsSidebarOpen(true);
      if (tabs.length === 0 && folder.files.length > 0) {
        openFileFromDisk(folder.files[0].path);
      } else {
        showToast(`Opened folder "${folder.folderName}" (${folder.files.length} documents)`, 3000);
      }
    },
    [tabs.length, openFileFromDisk, showToast]
  );

  const { isDragging, handleDragEnter, handleDragOver, handleDragLeave, handleDrop } = useFileDrop({
    onOpenFiles: openMultipleFilesFromDisk,
    onOpenFolder: handleOpenFolderFromDrop,
    onToast: (msg) => showToast(msg, 3000),
  });

  // Keyboard Shortcuts Hook
  useKeyboardShortcuts({
    activeTab,
    activeTabId,
    tabs,
    onOpenFile: handleOpenFile,
    onSaveFile: handleSaveFile,
    onNewTab: handleNewTab,
    onCloseTab: handleCloseTab,
    onSelectTab: setActiveTabId,
    onToggleViewMode: () =>
      setViewMode((m) => (m === 'view' ? 'split' : m === 'split' ? 'edit' : 'view')),
    onOpenSearch: () => setIsSearchOpen(true),
    onZoomIn: () => updateZoom(0.1),
    onZoomOut: () => updateZoom(-0.1),
    onZoomReset: resetZoom,
  });

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative flex h-screen w-screen flex-col overflow-hidden bg-fluent-bg-light font-sans text-fluent-text-primaryLight antialiased dark:bg-fluent-bg-dark dark:text-fluent-text-primaryDark"
    >
      {/* 1. TitleBar */}
      <TitleBar
        fileName={isOverviewActive ? 'Overview' : activeTab?.fileName || 'Untitled'}
        fileType={isOverviewActive ? undefined : activeTab?.fileType}
        isDirty={isOverviewActive ? false : activeTab?.isDirty || false}
        theme={theme}
        viewMode={viewMode}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        onOpenFile={handleOpenFile}
        onSaveFile={handleSaveFile}
        onNewFile={handleNewTab}
        onViewModeChange={setViewMode}
        onGoHome={() => setActiveTabId('overview')}
      />

      {/* 2. TabBar */}
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={setActiveTabId}
        onCloseTab={handleCloseTab}
        onCloseOtherTabs={handleCloseOtherTabs}
        onCloseTabsToRight={handleCloseTabsToRight}
        onCloseAllTabs={handleCloseAllTabs}
        onNewTab={handleNewTab}
        onShowOverview={() => setActiveTabId('overview')}
        onRevealInFolder={async (p) => window.api?.showInFolder(p)}
      />

      {/* 3. Main Workspace Area */}
      <div className="relative flex flex-1 overflow-hidden">
        {!isOverviewActive && (
          <Sidebar
            isOpen={isSidebarOpen}
            onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            content={activeTab?.content || ''}
            isMarkdown={activeTab?.fileType === 'markdown'}
            onSelectHeading={(id) =>
              document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
            }
            workspaceFolder={workspaceFolder}
            activeFilePath={activeTab?.filePath || null}
            recentFiles={recentFiles}
            onOpenFileFromPath={openFileFromDisk}
            onOpenFolderDialog={handleOpenFolder}
            onRevealInFolder={async (p) => window.api?.showInFolder(p)}
          />
        )}

        <div className="flex flex-1 overflow-hidden">
          <DocumentContentArea
            isOverviewActive={isOverviewActive}
            activeTab={activeTab}
            viewMode={viewMode}
            theme={theme}
            zoom={zoom}
            recentFiles={recentFiles}
            viewerContainerRef={viewerContainerRef}
            externalScrollPct={externalScrollPct}
            onOpenFile={handleOpenFile}
            onOpenFolder={handleOpenFolder}
            onNewDocument={handleNewTab}
            onSelectRecent={openFileFromDisk}
            onRemoveRecent={removeRecent}
            onClearRecent={clearRecents}
            onAnnotationsChange={handlePdfAnnotationsChange}
            onPdfDocumentChange={handlePdfDocumentChange}
            onPdfSignaturesChange={handlePdfSignaturesChange}
            onPdfRotationChange={handlePdfRotationChange}
            onSavePdf={handleSavePdf}
            onNotify={showToast}
            onContentChange={handleContentChange}
            canUndoContent={!!activeTab?.contentUndoStack.length}
            canRedoContent={!!activeTab?.contentRedoStack.length}
            onUndoContent={handleUndoContent}
            onRedoContent={handleRedoContent}
            onExportPDF={handleExportPDF}
            onEditorScroll={handleEditorScroll}
            onViewerScroll={handleViewerScroll}
          />
        </div>
      </div>

      {/* 4. StatusBar */}
      <StatusBar
        content={isOverviewActive ? '' : activeTab?.content || ''}
        fileType={isOverviewActive ? 'markdown' : activeTab?.fileType || 'markdown'}
        zoom={zoom}
        filePath={
          isOverviewActive
            ? recentFiles.length > 0
              ? `${recentFiles.length} Recent Documents`
              : 'Batch-Viewer Ready'
            : activeTab?.filePath || activeTab?.fileName || 'Untitled'
        }
        highlightCount={activeTab?.pdfHighlights?.length || 0}
        commentCount={activeTab?.pdfComments?.length || 0}
        onZoomIn={() => updateZoom(0.1)}
        onZoomOut={() => updateZoom(-0.1)}
        onZoomReset={resetZoom}
        onExportPDF={handleExportPDF}
        onExportHTML={activeTab?.fileType === 'markdown' ? handleExportHTML : undefined}
        onOpenSearch={() => setIsSearchOpen(true)}
        onCheckUpdates={() => setManualCheckTrigger((prev) => prev + 1)}
      />

      {/* Search Bar Modal */}
      {!isOverviewActive && (
        <SearchBar isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      )}

      {/* Drag & Drop Visual Indicator */}
      <DragDropOverlay isDragging={isDragging} />

      {/* Auto-Update Interactive Notification Banner */}
      <UpdateNotification
        manualCheckTrigger={manualCheckTrigger}
        onToastMessage={showUpdateToast}
      />

      {/* Toast Notification */}
      <ToastNotification message={updateToast} onClose={dismissToast} />
    </div>
  );
};
