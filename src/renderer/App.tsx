import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TitleBar } from './components/TitleBar';
import { TabBar } from './components/TabBar';
import { Sidebar } from './components/Sidebar';
import { MarkdownViewer } from './components/MarkdownViewer';
import { Editor } from './components/Editor';
import { PdfViewer } from './components/PdfViewer';
import { WordViewer } from './components/WordViewer';
import { TextEditor } from './components/TextEditor';
import { SearchBar } from './components/SearchBar';
import { StatusBar } from './components/StatusBar';
import { OverviewPage } from './components/OverviewPage';
import { DragDropOverlay } from './components/common/DragDropOverlay';
import { ToastNotification } from './components/common/ToastNotification';
import { WorkspaceFolder, FolderFileItem, detectFileType } from './types';
import { useRecentFiles } from './hooks/useRecentFiles';
import { useDocumentTabs } from './hooks/useDocumentTabs';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
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
    handlePdfAnnotationsChange,
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
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [updateToast, setUpdateToast] = useState<string | null>(null);
  const [externalScrollPct, setExternalScrollPct] = useState<number | null>(null);

  const viewerContainerRef = useRef<HTMLDivElement>(null);
  const isOverviewActive = activeTabId === 'overview' || tabs.length === 0 || !activeTab;

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
        setUpdateToast(`Opened folder "${folderName}" (${items.length} documents)`);
        setTimeout(() => setUpdateToast(null), 3000);
      }
    } else {
      setUpdateToast(`No supported documents found in selected folder`);
      setTimeout(() => setUpdateToast(null), 3000);
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
      setUpdateToast(`Exported to PDF: ${result.path.split(/[\/\\]/).pop()}`);
      setTimeout(() => setUpdateToast(null), 3500);
    }
  };

  // Export to HTML
  const handleExportHTML = async () => {
    if (!activeTab) return;
    const result = await exportMarkdownToHtml(activeTab.fileName);
    if (result.success && result.path) {
      setUpdateToast(`Exported HTML: ${result.path.split(/[\/\\]/).pop()}`);
      setTimeout(() => setUpdateToast(null), 3500);
    } else if (result.error) {
      setUpdateToast(`Export failed: ${result.error}`);
      setTimeout(() => setUpdateToast(null), 3500);
    }
  };

  // Drag and Drop (Electron 30+ webUtils API + directory drop support)
  const dragCounterRef = useRef(0);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current += 1;
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current = 0;
    setIsDragging(false);
    const fileList = e.dataTransfer.files;
    if (!fileList || fileList.length === 0) return;

    const paths: string[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      let p = '';
      if (window.api?.getPathForFile) {
        try {
          p = window.api.getPathForFile(file);
        } catch {}
      }
      if (!p && (file as any).path) {
        p = (file as any).path;
      }
      if (p) paths.push(p);
    }

    if (paths.length === 0) return;

    // Check if single dropped item is a folder
    if (paths.length === 1 && window.api?.getPathInfo) {
      const info = await window.api.getPathInfo(paths[0]);
      if (info.isDirectory && window.api.openDirectoryPath) {
        const res = await window.api.openDirectoryPath(paths[0]);
        if (res && res.files && res.files.length > 0) {
          const items: FolderFileItem[] = res.files.map((f: any) => ({
            name: f.name,
            path: f.path,
            fileType: detectFileType(f.path),
            size: f.size,
          }));
          const folderName = res.folderName || paths[0].split(/[\/\\]/).pop() || 'Workspace';
          setWorkspaceFolder({ dirPath: res.dirPath, folderName, files: items });
          setIsSidebarOpen(true);
          if (tabs.length === 0 && items.length > 0) {
            await openFileFromDisk(items[0].path);
          } else {
            setUpdateToast(`Opened folder "${folderName}" (${items.length} documents)`);
            setTimeout(() => setUpdateToast(null), 3000);
          }
          return;
        }
      }
    }

    // Open dropped file(s)
    openMultipleFilesFromDisk(paths);
  };

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
    onToggleViewMode: () => setViewMode((m) => (m === 'view' ? 'split' : m === 'split' ? 'edit' : 'view')),
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
      className="h-screen w-screen flex flex-col overflow-hidden bg-fluent-bg-light dark:bg-fluent-bg-dark text-fluent-text-primaryLight dark:text-fluent-text-primaryDark relative font-sans antialiased"
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
      <div className="flex-1 flex overflow-hidden relative">
        {!isOverviewActive && (
          <Sidebar
            isOpen={isSidebarOpen}
            onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            content={activeTab?.content || ''}
            isMarkdown={activeTab?.fileType === 'markdown'}
            onSelectHeading={(id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}
            workspaceFolder={workspaceFolder}
            activeFilePath={activeTab?.filePath || null}
            recentFiles={recentFiles}
            onOpenFileFromPath={openFileFromDisk}
            onOpenFolderDialog={handleOpenFolder}
            onRevealInFolder={async (p) => window.api?.showInFolder(p)}
          />
        )}

        <div className="flex-1 flex overflow-hidden">
          {isOverviewActive ? (
            <OverviewPage
              recentFiles={recentFiles}
              onOpenFile={handleOpenFile}
              onOpenFolder={handleOpenFolder}
              onNewDocument={handleNewTab}
              onSelectRecent={openFileFromDisk}
              onRemoveRecent={removeRecent}
              onClearRecent={clearRecents}
            />
          ) : activeTab.fileType === 'pdf' && activeTab.base64Data ? (
            <PdfViewer
              base64Data={activeTab.base64Data}
              filePath={activeTab.filePath}
              highlights={activeTab.pdfHighlights || []}
              comments={activeTab.pdfComments || []}
              zoom={zoom}
              onAnnotationsChange={handlePdfAnnotationsChange}
              onSavePdf={handleSavePdf}
            />
          ) : activeTab.fileType === 'word' ? (
            <WordViewer
              base64Data={activeTab.base64Data}
              initialHtml={activeTab.content}
              fileName={activeTab.fileName}
              zoom={zoom}
              onContentChange={handleContentChange}
              onSaveAsPdf={handleExportPDF}
            />
          ) : activeTab.fileType === 'text' ? (
            <TextEditor content={activeTab.content} onChange={handleContentChange} zoom={zoom} />
          ) : (
            <>
              {(viewMode === 'edit' || viewMode === 'split') && (
                <div className={`h-full overflow-hidden ${viewMode === 'split' ? 'w-1/2 border-r border-fluent-border-light dark:border-fluent-border-dark' : 'w-full'}`}>
                  <Editor
                    content={activeTab?.content || ''}
                    onChange={handleContentChange}
                    zoom={zoom}
                    onScroll={viewMode === 'split' ? handleEditorScroll : undefined}
                    externalScrollPct={viewMode === 'split' ? externalScrollPct : null}
                  />
                </div>
              )}
              {(viewMode === 'view' || viewMode === 'split') && (
                <div
                  ref={viewerContainerRef}
                  onScroll={viewMode === 'split' ? handleViewerScroll : undefined}
                  className={`h-full overflow-y-auto ${viewMode === 'split' ? 'w-1/2' : 'w-full'}`}
                >
                  <MarkdownViewer content={activeTab?.content || ''} dirName={activeTab?.dirName} theme={theme} zoom={zoom} />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 4. StatusBar */}
      <StatusBar
        content={isOverviewActive ? '' : activeTab?.content || ''}
        fileType={isOverviewActive ? 'markdown' : activeTab?.fileType || 'markdown'}
        zoom={zoom}
        filePath={isOverviewActive ? (recentFiles.length > 0 ? `${recentFiles.length} Recent Documents` : 'Batch-Viewer Ready') : activeTab?.filePath || activeTab?.fileName || 'Untitled'}
        highlightCount={activeTab?.pdfHighlights?.length || 0}
        commentCount={activeTab?.pdfComments?.length || 0}
        onZoomIn={() => updateZoom(0.1)}
        onZoomOut={() => updateZoom(-0.1)}
        onZoomReset={resetZoom}
        onExportPDF={handleExportPDF}
        onExportHTML={activeTab?.fileType === 'markdown' ? handleExportHTML : undefined}
        onOpenSearch={() => setIsSearchOpen(true)}
        onCheckUpdates={() => {
          setUpdateToast('Batch-Viewer v1.0.0 is up to date (Latest Stable Release)');
          setTimeout(() => setUpdateToast(null), 4000);
        }}
      />

      {/* Search Bar Modal */}
      {!isOverviewActive && <SearchBar isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />}

      {/* Drag & Drop Visual Indicator */}
      <DragDropOverlay isDragging={isDragging} />

      {/* Toast Notification */}
      <ToastNotification message={updateToast} onClose={() => setUpdateToast(null)} />
    </div>
  );
};
