import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  MousePointer,
  Highlighter,
  MessageSquare,
  List,
  Save,
  Check,
} from 'lucide-react';

interface PdfToolbarProps {
  currentPage: number;
  numPages: number;
  pageInput: string;
  isLoading: boolean;
  activeTool: 'select' | 'highlight' | 'comment';
  highlightColor: string;
  isNotesDrawerOpen: boolean;
  totalAnnotations: number;
  isSaving: boolean;
  saveSuccess: boolean;
  onPageInputChange: (value: string) => void;
  onPageInputCommit: () => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onSelectTool: (tool: 'select' | 'highlight' | 'comment') => void;
  onSelectColor: (color: string) => void;
  onToggleNotesDrawer: () => void;
  onSave: () => void;
}

const HIGHLIGHT_COLORS = [
  { hex: '#ffe066', name: 'Yellow' },
  { hex: '#a3e635', name: 'Green' },
  { hex: '#67e8f9', name: 'Cyan' },
  { hex: '#f472b6', name: 'Pink' },
  { hex: '#fb923c', name: 'Orange' },
];

export const PdfToolbar: React.FC<PdfToolbarProps> = ({
  currentPage,
  numPages,
  pageInput,
  isLoading,
  activeTool,
  highlightColor,
  isNotesDrawerOpen,
  totalAnnotations,
  isSaving,
  saveSuccess,
  onPageInputChange,
  onPageInputCommit,
  onPrevPage,
  onNextPage,
  onSelectTool,
  onSelectColor,
  onToggleNotesDrawer,
  onSave,
}) => {
  return (
    <div className="z-20 flex h-10 shrink-0 select-none items-center justify-between border-b border-fluent-border-light bg-fluent-card-light/95 px-4 text-xs shadow-sm dark:border-fluent-border-dark dark:bg-fluent-card-dark/95">
      {/* Page Navigation */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onPrevPage}
          disabled={currentPage <= 1 || isLoading}
          title="Previous Page"
          className="rounded p-1 transition-colors hover:bg-black/5 disabled:opacity-40 dark:hover:bg-white/10"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-1 font-mono text-xs">
          <input
            type="text"
            value={pageInput}
            disabled={isLoading}
            onChange={(e) => onPageInputChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onPageInputCommit()}
            onBlur={onPageInputCommit}
            className="w-9 rounded border border-fluent-border-light bg-black/5 py-0.5 text-center outline-none focus:border-fluent-accent dark:border-fluent-border-dark dark:bg-white/10"
          />
          <span className="opacity-60">/ {isLoading ? '...' : numPages || 1}</span>
        </div>
        <button
          onClick={onNextPage}
          disabled={currentPage >= numPages || isLoading}
          title="Next Page"
          className="rounded p-1 transition-colors hover:bg-black/5 disabled:opacity-40 dark:hover:bg-white/10"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Tools: Select, Highlight, Comment */}
      <div className="flex items-center gap-1 rounded-lg border border-fluent-border-light bg-black/5 p-0.5 dark:border-fluent-border-dark dark:bg-white/5">
        <button
          onClick={() => onSelectTool('select')}
          title="Select / Pointer Tool"
          className={`flex items-center gap-1.5 rounded px-2.5 py-1 transition-all ${
            activeTool === 'select'
              ? 'bg-fluent-accent text-white shadow-sm'
              : 'text-fluent-text-secondaryLight hover:bg-black/5 dark:text-fluent-text-secondaryDark dark:hover:bg-white/10'
          }`}
        >
          <MousePointer className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Select</span>
        </button>

        <button
          onClick={() => onSelectTool('highlight')}
          title="Highlight Mode (Drag over text or area to highlight)"
          className={`flex items-center gap-1.5 rounded px-2.5 py-1 transition-all ${
            activeTool === 'highlight'
              ? 'bg-fluent-accent text-white shadow-sm'
              : 'text-fluent-text-secondaryLight hover:bg-black/5 dark:text-fluent-text-secondaryDark dark:hover:bg-white/10'
          }`}
        >
          <Highlighter className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Highlight</span>
        </button>

        {activeTool === 'highlight' && (
          <div className="flex items-center gap-1 border-l border-fluent-border-light px-1.5 dark:border-fluent-border-dark">
            {HIGHLIGHT_COLORS.map((c) => (
              <button
                key={c.hex}
                onClick={() => onSelectColor(c.hex)}
                title={c.name}
                style={{ backgroundColor: c.hex }}
                className={`h-4 w-4 rounded-full border ${
                  highlightColor === c.hex
                    ? 'scale-110 ring-2 ring-fluent-accent'
                    : 'opacity-70 hover:opacity-100'
                } transition-all`}
              />
            ))}
          </div>
        )}

        <button
          onClick={() => onSelectTool('comment')}
          title="Add Comment Pin (Click anywhere on page to place note)"
          className={`flex items-center gap-1.5 rounded px-2.5 py-1 transition-all ${
            activeTool === 'comment'
              ? 'bg-fluent-accent text-white shadow-sm'
              : 'text-fluent-text-secondaryLight hover:bg-black/5 dark:text-fluent-text-secondaryDark dark:hover:bg-white/10'
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Comment</span>
        </button>
      </div>

      {/* Action Buttons: Notes Drawer & Save */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleNotesDrawer}
          title="Annotations & Comments List"
          className={`flex items-center gap-1.5 rounded px-2.5 py-1 font-medium transition-all ${
            isNotesDrawerOpen
              ? 'bg-fluent-accent text-white shadow-sm'
              : 'text-fluent-text-secondaryLight hover:bg-black/5 dark:text-fluent-text-secondaryDark dark:hover:bg-white/10'
          }`}
        >
          <List className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Notes</span>
          {totalAnnotations > 0 && (
            <span
              className={`py-0.2 rounded-full px-1.5 text-[10px] font-bold ${
                isNotesDrawerOpen ? 'bg-white text-fluent-accent' : 'bg-fluent-accent text-white'
              }`}
            >
              {totalAnnotations}
            </span>
          )}
        </button>

        <button
          onClick={onSave}
          disabled={isSaving || isLoading}
          title="Save PDF with Highlights & Comments (Ctrl+S)"
          className={`flex items-center gap-1.5 rounded px-3 py-1 font-medium transition-all ${
            saveSuccess
              ? 'bg-emerald-600 text-white'
              : 'bg-fluent-accent text-white shadow-sm hover:opacity-90 disabled:opacity-50'
          }`}
        >
          {saveSuccess ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>Saved!</span>
            </>
          ) : isSaving ? (
            <>
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5" />
              <span>Save PDF</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
