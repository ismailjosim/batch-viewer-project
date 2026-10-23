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
    <div className="h-10 px-4 flex items-center justify-between bg-fluent-card-light/95 dark:bg-fluent-card-dark/95 border-b border-fluent-border-light dark:border-fluent-border-dark select-none text-xs shrink-0 z-20 shadow-sm">
      {/* Page Navigation */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onPrevPage}
          disabled={currentPage <= 1 || isLoading}
          title="Previous Page"
          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-40 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-1 font-mono text-xs">
          <input
            type="text"
            value={pageInput}
            disabled={isLoading}
            onChange={(e) => onPageInputChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onPageInputCommit()}
            onBlur={onPageInputCommit}
            className="w-9 text-center py-0.5 rounded bg-black/5 dark:bg-white/10 border border-fluent-border-light dark:border-fluent-border-dark outline-none focus:border-fluent-accent"
          />
          <span className="opacity-60">/ {isLoading ? '...' : (numPages || 1)}</span>
        </div>
        <button
          onClick={onNextPage}
          disabled={currentPage >= numPages || isLoading}
          title="Next Page"
          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-40 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Tools: Select, Highlight, Comment */}
      <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-0.5 rounded-lg border border-fluent-border-light dark:border-fluent-border-dark">
        <button
          onClick={() => onSelectTool('select')}
          title="Select / Pointer Tool"
          className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-all ${
            activeTool === 'select'
              ? 'bg-fluent-accent text-white shadow-sm'
              : 'hover:bg-black/5 dark:hover:bg-white/10 text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark'
          }`}
        >
          <MousePointer className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Select</span>
        </button>

        <button
          onClick={() => onSelectTool('highlight')}
          title="Highlight Mode (Drag over text or area to highlight)"
          className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-all ${
            activeTool === 'highlight'
              ? 'bg-fluent-accent text-white shadow-sm'
              : 'hover:bg-black/5 dark:hover:bg-white/10 text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark'
          }`}
        >
          <Highlighter className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Highlight</span>
        </button>

        {activeTool === 'highlight' && (
          <div className="flex items-center gap-1 px-1.5 border-l border-fluent-border-light dark:border-fluent-border-dark">
            {HIGHLIGHT_COLORS.map((c) => (
              <button
                key={c.hex}
                onClick={() => onSelectColor(c.hex)}
                title={c.name}
                style={{ backgroundColor: c.hex }}
                className={`w-4 h-4 rounded-full border ${
                  highlightColor === c.hex ? 'ring-2 ring-fluent-accent scale-110' : 'opacity-70 hover:opacity-100'
                } transition-all`}
              />
            ))}
          </div>
        )}

        <button
          onClick={() => onSelectTool('comment')}
          title="Add Comment Pin (Click anywhere on page to place note)"
          className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-all ${
            activeTool === 'comment'
              ? 'bg-fluent-accent text-white shadow-sm'
              : 'hover:bg-black/5 dark:hover:bg-white/10 text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Comment</span>
        </button>
      </div>

      {/* Action Buttons: Notes Drawer & Save */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleNotesDrawer}
          title="Annotations & Comments List"
          className={`px-2.5 py-1 rounded font-medium flex items-center gap-1.5 transition-all ${
            isNotesDrawerOpen
              ? 'bg-fluent-accent text-white shadow-sm'
              : 'hover:bg-black/5 dark:hover:bg-white/10 text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark'
          }`}
        >
          <List className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Notes</span>
          {totalAnnotations > 0 && (
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
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
          className={`px-3 py-1 rounded font-medium flex items-center gap-1.5 transition-all ${
            saveSuccess
              ? 'bg-emerald-600 text-white'
              : 'bg-fluent-accent text-white hover:opacity-90 shadow-sm disabled:opacity-50'
          }`}
        >
          {saveSuccess ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Saved!</span>
            </>
          ) : isSaving ? (
            <>
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Save PDF</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
