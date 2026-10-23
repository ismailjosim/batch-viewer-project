import React, { useMemo } from 'react';
import { Search, FileDown, ZoomIn, ZoomOut, ArrowUpCircle, Globe } from 'lucide-react';
import { DocumentType } from '../types';

interface StatusBarProps {
  content: string;
  fileType: DocumentType;
  zoom: number;
  filePath: string | null;
  highlightCount?: number;
  commentCount?: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onExportPDF: () => void;
  onExportHTML?: () => void;
  onOpenSearch: () => void;
  onCheckUpdates?: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  content,
  fileType,
  zoom,
  filePath,
  highlightCount = 0,
  commentCount = 0,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onExportPDF,
  onExportHTML,
  onOpenSearch,
  onCheckUpdates,
}) => {
  const stats = useMemo(() => {
    if (fileType === 'pdf') {
      return null;
    }
    const clean = content.replace(/[#*`_~[\]()]/g, '');
    const words = clean.trim() ? clean.trim().split(/\s+/).length : 0;
    const chars = content.length;
    const readMinutes = Math.max(1, Math.ceil(words / 200));
    return { words, chars, readMinutes };
  }, [content, fileType]);

  return (
    <footer className="flex h-7 w-full shrink-0 select-none items-center justify-between border-t border-fluent-border-light bg-fluent-card-light/60 px-3 text-[11px] text-fluent-text-secondaryLight dark:border-fluent-border-dark dark:bg-fluent-card-dark/60 dark:text-fluent-text-secondaryDark">
      {/* Left: File info / stats */}
      <div className="flex items-center gap-4 truncate">
        <span className="max-w-xs truncate opacity-75">{filePath || 'Untitled'}</span>

        {stats ? (
          <div className="hidden items-center gap-3 opacity-90 sm:flex">
            <span>{stats.words.toLocaleString()} words</span>
            <span>•</span>
            <span>{stats.chars.toLocaleString()} chars</span>
            <span>•</span>
            <span>~{stats.readMinutes} min read</span>
          </div>
        ) : fileType === 'pdf' ? (
          <div className="hidden items-center gap-3 opacity-90 sm:flex">
            <span>{highlightCount} Highlights</span>
            <span>•</span>
            <span>{commentCount} Notes</span>
          </div>
        ) : null}
      </div>

      {/* Right: Actions & Zoom */}
      <div className="flex items-center gap-1">
        {fileType === 'markdown' || fileType === 'text' ? (
          <button
            onClick={onOpenSearch}
            title="Search in document (Ctrl+F)"
            className="mr-2 flex items-center gap-1 rounded p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          >
            <Search className="h-3 w-3 text-fluent-accent" />
            <span className="hidden md:inline">Find</span>
          </button>
        ) : null}

        {fileType === 'markdown' && (
          <>
            <button
              onClick={onExportPDF}
              title="Export as PDF"
              className="mr-1 flex items-center gap-1 rounded p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
            >
              <FileDown className="h-3 w-3" />
              <span className="hidden md:inline">PDF</span>
            </button>

            {onExportHTML && (
              <button
                onClick={onExportHTML}
                title="Export as Standalone HTML file"
                className="mr-2 flex items-center gap-1 rounded p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
              >
                <Globe className="h-3 w-3 text-fluent-accent" />
                <span className="hidden md:inline">HTML</span>
              </button>
            )}
          </>
        )}

        {onCheckUpdates && (
          <button
            onClick={onCheckUpdates}
            title="Check for updates"
            className="mr-1 flex items-center gap-1 rounded p-1 text-[10px] transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          >
            <ArrowUpCircle className="h-3 w-3 text-emerald-500" />
            <span className="hidden lg:inline">v1.0.2</span>
          </button>
        )}

        <div className="mx-1 h-3 w-[1px] bg-fluent-border-light dark:border-fluent-border-dark" />

        <button
          onClick={onZoomOut}
          title="Zoom Out (Ctrl -)"
          className="rounded p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
        >
          <ZoomOut className="h-3 w-3" />
        </button>

        <button
          onClick={onZoomReset}
          title="Reset Zoom (Ctrl 0)"
          className="rounded px-1.5 py-0.5 font-mono transition-colors hover:bg-black/5 dark:hover:bg-white/10"
        >
          {Math.round(zoom * 100)}%
        </button>

        <button
          onClick={onZoomIn}
          title="Zoom In (Ctrl +)"
          className="rounded p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
        >
          <ZoomIn className="h-3 w-3" />
        </button>
      </div>
    </footer>
  );
};
