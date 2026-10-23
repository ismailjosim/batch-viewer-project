import { useState, useCallback } from 'react';
import { RecentDocument, DocumentType } from '../types';

const RECENT_FILES_STORAGE_KEY = 'batch_viewer_recent_documents_v1';

export function useRecentFiles() {
  const [recentFiles, setRecentFiles] = useState<RecentDocument[]>(() => {
    try {
      const raw = localStorage.getItem(RECENT_FILES_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const addToRecents = useCallback((filePath: string, fileName: string, fileType: DocumentType) => {
    if (!filePath) return;
    setRecentFiles((prev) => {
      const filtered = prev.filter((f) => f.filePath.toLowerCase() !== filePath.toLowerCase());
      const updated: RecentDocument[] = [
        {
          filePath,
          fileName: fileName || filePath.split(/[\/\\]/).pop() || 'Document',
          fileType,
          lastOpened: Date.now(),
        },
        ...filtered,
      ].slice(0, 30);
      try {
        localStorage.setItem(RECENT_FILES_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const removeRecent = useCallback((filePath: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentFiles((prev) => {
      const updated = prev.filter((f) => f.filePath !== filePath);
      try {
        localStorage.setItem(RECENT_FILES_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const clearRecents = useCallback(() => {
    setRecentFiles([]);
    try {
      localStorage.removeItem(RECENT_FILES_STORAGE_KEY);
    } catch {}
  }, []);

  return {
    recentFiles,
    addToRecents,
    removeRecent,
    clearRecents,
  };
}
