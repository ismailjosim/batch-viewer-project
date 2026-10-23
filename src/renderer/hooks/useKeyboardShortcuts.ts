import { useEffect } from 'react';
import { DocumentTab } from '../types';

interface UseKeyboardShortcutsProps {
  activeTab: DocumentTab | undefined;
  activeTabId: string;
  tabs: DocumentTab[];
  onOpenFile: () => void;
  onSaveFile: () => void;
  onNewTab: () => void;
  onCloseTab: (id: string) => void;
  onSelectTab: (id: string) => void;
  onToggleViewMode: () => void;
  onOpenSearch: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
}

export function useKeyboardShortcuts({
  activeTab,
  activeTabId,
  tabs,
  onOpenFile,
  onSaveFile,
  onNewTab,
  onCloseTab,
  onSelectTab,
  onToggleViewMode,
  onOpenSearch,
  onZoomIn,
  onZoomOut,
  onZoomReset,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + O
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        onOpenFile();
      }
      // Ctrl + S
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (activeTabId !== 'overview') {
          onSaveFile();
        }
      }
      // Ctrl + N
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        onNewTab();
      }
      // Ctrl + W
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        if (activeTabId !== 'overview') {
          onCloseTab(activeTabId);
        }
      }
      // Ctrl + Tab
      if ((e.ctrlKey || e.metaKey) && e.key === 'Tab') {
        e.preventDefault();
        if (tabs.length > 0) {
          const currentIndex = tabs.findIndex((t) => t.id === activeTabId);
          if (currentIndex === -1) {
            onSelectTab(tabs[0].id);
          } else {
            const nextIndex = (currentIndex + 1) % tabs.length;
            onSelectTab(tabs[nextIndex].id);
          }
        }
      }
      // Ctrl + E (Toggle View Mode)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        if (activeTab?.fileType === 'markdown') {
          onToggleViewMode();
        }
      }
      // Ctrl + F (Find)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        if (activeTabId !== 'overview') {
          onOpenSearch();
        }
      }
      // Zoom
      if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        onZoomIn();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        onZoomOut();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        onZoomReset();
      }
    };

    // Ctrl + Mouse Wheel Zoom
    let lastWheelTime = 0;
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        if (activeTabId !== 'overview' && activeTab) {
          const now = Date.now();
          if (now - lastWheelTime < 50) return;
          lastWheelTime = now;

          if (e.deltaY < 0) {
            onZoomIn();
          } else if (e.deltaY > 0) {
            onZoomOut();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [
    tabs,
    activeTabId,
    activeTab,
    onOpenFile,
    onSaveFile,
    onNewTab,
    onCloseTab,
    onSelectTab,
    onToggleViewMode,
    onOpenSearch,
    onZoomIn,
    onZoomOut,
    onZoomReset,
  ]);
}
