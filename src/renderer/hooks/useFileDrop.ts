import { useState, useRef, useCallback } from 'react';
import { FolderFileItem, detectFileType } from '../types';

interface UseFileDropProps {
  onOpenFiles: (paths: string[]) => void;
  onOpenFolder: (folder: { dirPath: string; folderName: string; files: FolderFileItem[] }) => void;
  onToast: (msg: string) => void;
}

export function useFileDrop({ onOpenFiles, onOpenFolder, onToast }: UseFileDropProps) {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragCounterRef = useRef<number>(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current += 1;
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    setIsDragging(true);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
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
          } catch { }
        }
        if (!p && (file as any).path) {
          p = (file as any).path;
        }
        if (p) paths.push(p);
      }

      if (paths.length === 0) return;

      // Check if dropped item is a directory
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
            onOpenFolder({ dirPath: res.dirPath, folderName, files: items });
            return;
          } else {
            onToast('No supported documents found in dropped folder');
            return;
          }
        }
      }

      // Open dropped document file(s)
      onOpenFiles(paths);
    },
    [onOpenFiles, onOpenFolder, onToast]
  );

  return {
    isDragging,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
}
