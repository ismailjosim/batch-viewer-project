import React, { useMemo } from "react";
import {
  Search,
  FileDown,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ArrowUpCircle,
  Globe,
} from "lucide-react";
import { DocumentType } from "../types";

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
    if (fileType === "pdf") {
      return null;
    }
    const clean = content.replace(/[#*`_~[\]()]/g, "");
    const words = clean.trim() ? clean.trim().split(/\s+/).length : 0;
    const chars = content.length;
    const readMinutes = Math.max(1, Math.ceil(words / 200));
    return { words, chars, readMinutes };
  }, [content, fileType]);

  return (
    <footer className="h-7 w-full flex items-center justify-between px-3 bg-fluent-card-light/60 dark:bg-fluent-card-dark/60 border-t border-fluent-border-light dark:border-fluent-border-dark select-none text-[11px] text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark shrink-0">
      {/* Left: File info / stats */}
      <div className="flex items-center gap-4 truncate">
        <span className="truncate max-w-xs opacity-75">
          {filePath || "Untitled"}
        </span>

        {stats ? (
          <div className="hidden sm:flex items-center gap-3 opacity-90">
            <span>{stats.words.toLocaleString()} words</span>
            <span>•</span>
            <span>{stats.chars.toLocaleString()} chars</span>
            <span>•</span>
            <span>~{stats.readMinutes} min read</span>
          </div>
        ) : fileType === "pdf" ? (
          <div className="hidden sm:flex items-center gap-3 opacity-90">
            <span>{highlightCount} Highlights</span>
            <span>•</span>
            <span>{commentCount} Notes</span>
          </div>
        ) : null}
      </div>

      {/* Right: Actions & Zoom */}
      <div className="flex items-center gap-1">
        {fileType === "markdown" || fileType === "text" ? (
          <button
            onClick={onOpenSearch}
            title="Search in document (Ctrl+F)"
            className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center gap-1 mr-2"
          >
            <Search className="w-3 h-3 text-fluent-accent" />
            <span className="hidden md:inline">Find</span>
          </button>
        ) : null}

        {fileType === "markdown" && (
          <>
            <button
              onClick={onExportPDF}
              title="Export as PDF"
              className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center gap-1 mr-1"
            >
              <FileDown className="w-3 h-3" />
              <span className="hidden md:inline">PDF</span>
            </button>

            {onExportHTML && (
              <button
                onClick={onExportHTML}
                title="Export as Standalone HTML file"
                className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center gap-1 mr-2"
              >
                <Globe className="w-3 h-3 text-fluent-accent" />
                <span className="hidden md:inline">HTML</span>
              </button>
            )}
          </>
        )}

        {onCheckUpdates && (
          <button
            onClick={onCheckUpdates}
            title="Check for updates"
            className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center gap-1 mr-1 text-[10px]"
          >
            <ArrowUpCircle className="w-3 h-3 text-emerald-500" />
            <span className="hidden lg:inline">v1.0.0</span>
          </button>
        )}

        <div className="w-[1px] h-3 bg-fluent-border-light dark:border-fluent-border-dark mx-1" />

        <button
          onClick={onZoomOut}
          title="Zoom Out (Ctrl -)"
          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <ZoomOut className="w-3 h-3" />
        </button>

        <button
          onClick={onZoomReset}
          title="Reset Zoom (Ctrl 0)"
          className="px-1.5 py-0.5 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors font-mono"
        >
          {Math.round(zoom * 100)}%
        </button>

        <button
          onClick={onZoomIn}
          title="Zoom In (Ctrl +)"
          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <ZoomIn className="w-3 h-3" />
        </button>
      </div>
    </footer>
  );
};
