import React from "react";
import { Bookmark, X, Trash2 } from "lucide-react";
import { PdfHighlight, PdfComment } from "../../types";

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
    <aside className="w-72 h-full border-l border-fluent-border-light dark:border-fluent-border-dark bg-fluent-card-light/95 dark:bg-fluent-card-dark/95 backdrop-blur-md flex flex-col text-xs z-30 shadow-xl animate-in slide-in-from-right-4 select-none">
      <div className="flex items-center justify-between p-3 border-b border-fluent-border-light dark:border-fluent-border-dark font-semibold">
        <div className="flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-fluent-accent" />
          <span>Annotations ({highlights.length + comments.length})</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Comments Section */}
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark mb-2 block">
            Comments & Sticky Notes ({comments.length})
          </span>
          {comments.length === 0 ? (
            <p className="text-[11px] opacity-50 italic">No comments placed</p>
          ) : (
            <div className="space-y-1.5">
              {comments.map((c) => (
                <div
                  key={c.id}
                  onClick={() => onSelectComment(c.id, c.pageNumber)}
                  className="p-2 rounded-lg bg-black/5 dark:bg-white/5 border border-fluent-border-light dark:border-fluent-border-dark hover:border-fluent-accent/50 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-fluent-accent text-[11px]">
                      Page {c.pageNumber}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] opacity-50">
                        {c.createdAt}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteComment(c.id);
                        }}
                        title="Delete Comment"
                        className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-500 rounded transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-fluent-text-primaryLight dark:text-fluent-text-primaryDark line-clamp-3">
                    {c.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Highlights Section */}
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark mb-2 block">
            Highlights ({highlights.length})
          </span>
          {highlights.length === 0 ? (
            <p className="text-[11px] opacity-50 italic">
              No highlights created
            </p>
          ) : (
            <div className="space-y-1.5">
              {highlights.map((h) => (
                <div
                  key={h.id}
                  onClick={() => onSelectPage(h.pageNumber)}
                  className="p-2 rounded-lg bg-black/5 dark:bg-white/5 border border-fluent-border-light dark:border-fluent-border-dark hover:border-fluent-accent/50 cursor-pointer transition-colors group flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div
                      style={{ backgroundColor: h.color }}
                      className="w-3 h-3 rounded-full shrink-0 border border-black/20"
                    />
                    <span className="font-medium text-xs">
                      Highlight on Page {h.pageNumber}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteHighlight(h.id);
                    }}
                    title="Delete Highlight"
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-500 rounded transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
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
