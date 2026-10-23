import { useState, useCallback, useEffect, useRef } from 'react';
import { DocumentTab, detectFileType, PdfHighlight, PdfComment, DocumentType } from '../types';

interface UseDocumentTabsProps {
  onAddToRecents: (filePath: string, fileName: string, fileType: DocumentType) => void;
}

export function useDocumentTabs({ onAddToRecents }: UseDocumentTabsProps) {
  const [tabs, setTabs] = useState<DocumentTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('overview');

  const tabsRef = useRef<DocumentTab[]>(tabs);
  tabsRef.current = tabs;

  const hasLoadedInitialRef = useRef<boolean>(false);
  const openingPathsRef = useRef<Set<string>>(new Set());

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const zoom = activeTab?.zoom || 1.0;

  // Update content of active tab
  const handleContentChange = useCallback((newContent: string) => {
    setTabs((prev) =>
      prev.map((t) => {
        if (t.id === activeTabId) {
          return {
            ...t,
            content: newContent,
            isDirty: newContent !== t.originalContent,
          };
        }
        return t;
      })
    );
  }, [activeTabId]);

  // Update PDF annotations of active tab
  const handlePdfAnnotationsChange = useCallback(
    (highlights: PdfHighlight[], comments: PdfComment[]) => {
      setTabs((prev) =>
        prev.map((t) => {
          if (t.id === activeTabId) {
            return {
              ...t,
              pdfHighlights: highlights,
              pdfComments: comments,
              isDirty: true,
            };
          }
          return t;
        })
      );
    },
    [activeTabId]
  );

  // Open single file helper
  const openFileFromDisk = useCallback(
    async (path: string) => {
      if (!window.api || !path) return;
      const normalizedPath = path.toLowerCase();

      // Check if already open
      const existing = tabsRef.current.find((t) => t.filePath && t.filePath.toLowerCase() === normalizedPath);
      if (existing) {
        setActiveTabId(existing.id);
        return;
      }

      // Prevent concurrent duplicate openings
      if (openingPathsRef.current.has(normalizedPath)) return;
      openingPathsRef.current.add(normalizedPath);

      try {
        const fileType = detectFileType(path);
        const isBin = fileType === 'pdf' || fileType === 'word';
        const res = isBin ? await window.api.readBinaryFile(path) : await window.api.readFile(path);

        if (res.success) {
          const tabFileName = res.fileName || path.split(/[\/\\]/).pop() || 'Document';
          const textContent = 'content' in res && res.content !== undefined ? res.content : '';
          const base64Data = 'base64' in res ? res.base64 : undefined;

          const newTab: DocumentTab = {
            id: `tab-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            filePath: path,
            fileName: tabFileName,
            fileType,
            content: textContent,
            originalContent: textContent,
            base64Data,
            dirName: res.dirName,
            isDirty: false,
            pdfHighlights: [],
            pdfComments: [],
            zoom: 1.0,
          };

          setTabs((prev) => [...prev, newTab]);
          setActiveTabId(newTab.id);
          onAddToRecents(path, tabFileName, fileType);
          window.api.watchFile(path);
        }
      } finally {
        openingPathsRef.current.delete(normalizedPath);
      }
    },
    [onAddToRecents]
  );

  // Open multiple files from disk
  const openMultipleFilesFromDisk = useCallback(
    async (paths: string[]) => {
      for (const p of paths) {
        await openFileFromDisk(p);
      }
    },
    [openFileFromDisk]
  );

  // Initial file opening & CLI event listeners (Mount once)
  useEffect(() => {
    if (!window.api) return;

    if (!hasLoadedInitialRef.current) {
      hasLoadedInitialRef.current = true;
      window.api.getInitialFiles().then((initials) => {
        if (initials && initials.length > 0) {
          openMultipleFilesFromDisk(initials);
        }
      });
    }

    const unsubMultipleCLI = window.api.onFilesOpenedFromCLI((paths) => {
      openMultipleFilesFromDisk(paths);
    });

    const unsubSingleCLI = window.api.onFileOpenedFromCLI((path) => {
      openFileFromDisk(path);
    });

    const unsubDisk = window.api.onFileChangedOnDisk((changedPath) => {
      setTabs((prev) =>
        prev.map((t) => {
          if (t.filePath === changedPath && !t.isDirty) {
            if (t.fileType === 'markdown' || t.fileType === 'text') {
              window.api.readFile(changedPath).then((res) => {
                if (res.success && res.content) {
                  setTabs((curr) =>
                    curr.map((item) =>
                      item.id === t.id
                        ? { ...item, content: res.content!, originalContent: res.content! }
                        : item
                    )
                  );
                }
              });
            }
          }
          return t;
        })
      );
    });

    return () => {
      unsubMultipleCLI();
      unsubSingleCLI();
      unsubDisk();
      window.api.unwatchFile();
    };
  }, [openFileFromDisk, openMultipleFilesFromDisk]);

  // Tab Operations
  const handleNewTab = () => {
    const newTab: DocumentTab = {
      id: `tab-${Date.now()}`,
      filePath: null,
      fileName: 'Untitled.md',
      fileType: 'markdown',
      content: '# New Document\n\nStart typing here...\n',
      originalContent: '',
      isDirty: true,
      zoom: 1.0,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  const handleCloseTab = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newTabs = tabs.filter((t) => t.id !== id);
    setTabs(newTabs);

    if (newTabs.length === 0) {
      setActiveTabId('overview');
    } else if (activeTabId === id) {
      const index = tabs.findIndex((t) => t.id === id);
      const nextIndex = Math.max(0, index - 1);
      setActiveTabId(newTabs[nextIndex]?.id || 'overview');
    }
  };

  const handleCloseOtherTabs = (id: string) => {
    const remaining = tabs.filter((t) => t.id === id);
    setTabs(remaining);
    setActiveTabId(id);
  };

  const handleCloseTabsToRight = (id: string) => {
    const idx = tabs.findIndex((t) => t.id === id);
    if (idx !== -1) {
      const remaining = tabs.slice(0, idx + 1);
      setTabs(remaining);
      if (!remaining.some((t) => t.id === activeTabId)) {
        setActiveTabId(id);
      }
    }
  };

  const handleCloseAllTabs = () => {
    setTabs([]);
    setActiveTabId('overview');
  };

  // Save current active tab
  const handleSaveFile = async () => {
    if (!window.api || !activeTab) return;
    if (activeTab.fileType === 'pdf') return;

    let targetPath = activeTab.filePath;
    if (!targetPath) {
      const selected = await window.api.saveFileDialog(activeTab.fileName);
      if (!selected) return;
      targetPath = selected;
    }

    const res = await window.api.saveFile(targetPath, activeTab.content);
    if (res.success) {
      const savedName = targetPath.split(/[\/\\]/).pop() || activeTab.fileName;
      setTabs((prev) =>
        prev.map((t) => {
          if (t.id === activeTab.id) {
            return {
              ...t,
              filePath: targetPath,
              fileName: savedName,
              originalContent: t.content,
              isDirty: false,
            };
          }
          return t;
        })
      );
      onAddToRecents(targetPath, savedName, activeTab.fileType);
      window.api.watchFile(targetPath);
    }
  };

  // Save PDF annotations
  const handleSavePdf = async (newBase64: string) => {
    if (!window.api || !activeTab) return;
    let targetPath = activeTab.filePath;
    if (!targetPath) {
      targetPath = await window.api.saveFileDialog('Document_annotated.pdf');
      if (!targetPath) return;
    }

    const res = await window.api.saveBinaryFile(targetPath, newBase64);
    if (res.success) {
      const savedName = targetPath.split(/[\/\\]/).pop() || activeTab.fileName;
      setTabs((prev) =>
        prev.map((t) => {
          if (t.id === activeTab.id) {
            return {
              ...t,
              filePath: targetPath,
              fileName: savedName,
              base64Data: newBase64,
              isDirty: false,
            };
          }
          return t;
        })
      );
      onAddToRecents(targetPath, savedName, 'pdf');
    }
  };

  // Zoom helpers
  const updateZoom = (delta: number) => {
    setTabs((prev) =>
      prev.map((t) => {
        if (t.id === activeTabId) {
          const current = t.zoom || 1.0;
          const next = Math.min(2.5, Math.max(0.5, Number((current + delta).toFixed(1))));
          return { ...t, zoom: next };
        }
        return t;
      })
    );
  };

  const resetZoom = () => {
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, zoom: 1.0 } : t))
    );
  };

  return {
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
  };
}
