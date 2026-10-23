import React from 'react';
import { Bookmark, X, Trash2 } from 'lucide-react';
import { PdfHighlight, PdfComment } from '../../types';

interface PdfNotesDrawerProps {
  isOpen: boolean;
  highlights: PdfHighlight[];
  comments: PdfComment[];
  onClose: () => void;
  onSelectPage: (pageNumber: number) => void;
  onSelectComment: (id: string, pageNumber: number) => void;
  onDeleteHighlight: (id: string) => void;
  onDeleteComment: (id: string) => void;
}

export const PdfNotesDrawer: React.FC<PdfNotesDrawerProps> = ({
  isOpen,
  highlights,
  comments,
  onClose,
  onSelectPage,
  onSelectComment,
  onDeleteHighlight,
  onDeleteComment,
}) => {
  if (!isOpen) return null;

  return (
    <aside className="animate-in slide-in-from-right-4 z-30 flex h-full w-72 select-none flex-col border-l border-fluent-border-light bg-fluent-card-light/95 text-xs shadow-xl backdrop-blur-md dark:border-fluent-border-dark dark:bg-fluent-card-dark/95">
      <div className="flex items-center justify-between border-b border-fluent-border-light p-3 font-semibold dark:border-fluent-border-dark">
        <div className="flex items-center gap-2">
          <Bookmark className="h-4 w-4 text-fluent-accent" />
          <span>Annotations ({highlights.length + comments.length})</span>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-3">
        {/* Comments Section */}
        <div>
          <span className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark">
            Comments & Sticky Notes ({comments.length})
          </span>
          {comments.length === 0 ? (
            <p className="text-[11px] italic opacity-50">No comments placed</p>
          ) : (
            <div className="space-y-1.5">
              {comments.map((c) => (
                <div
                  key={c.id}
                  onClick={() => onSelectComment(c.id, c.pageNumber)}
                  className="group cursor-pointer rounded-lg border border-fluent-border-light bg-black/5 p-2 transition-colors hover:border-fluent-accent/50 dark:border-fluent-border-dark dark:bg-white/5"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-fluent-accent">
                      Page {c.pageNumber}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] opacity-50">{c.createdAt}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteComment(c.id);
                        }}
                        title="Delete Comment"
                        className="rounded p-0.5 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <p className="line-clamp-3 text-[11px] text-fluent-text-primaryLight dark:text-fluent-text-primaryDark">
                    {c.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Highlights Section */}
        <div>
          <span className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark">
            Highlights ({highlights.length})
          </span>
          {highlights.length === 0 ? (
            <p className="text-[11px] italic opacity-50">No highlights created</p>
          ) : (
            <div className="space-y-1.5">
              {highlights.map((h) => (
                <div
                  key={h.id}
                  onClick={() => onSelectPage(h.pageNumber)}
                  className="group flex cursor-pointer items-center justify-between rounded-lg border border-fluent-border-light bg-black/5 p-2 transition-colors hover:border-fluent-accent/50 dark:border-fluent-border-dark dark:bg-white/5"
                >
                  <div className="flex items-center gap-2">
                    <div
                      style={{ backgroundColor: h.color }}
                      className="h-3 w-3 shrink-0 rounded-full border border-black/20"
                    />
                    <span className="text-xs font-medium">Highlight on Page {h.pageNumber}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteHighlight(h.id);
                    }}
                    title="Delete Highlight"
                    className="rounded p-0.5 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
