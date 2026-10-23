import React from "react";
import { MessageSquare, X } from "lucide-react";

interface PdfCommentModalProps {
  pageNumber: number;
  commentInput: string;
  onChangeInput: (val: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const PdfCommentModal: React.FC<PdfCommentModalProps> = ({
  pageNumber,
  commentInput,
  onChangeInput,
  onSubmit,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center animate-in fade-in select-none">
      <div className="w-80 p-4 bg-fluent-card-light dark:bg-fluent-card-dark border border-fluent-border-light dark:border-fluent-border-dark rounded-xl shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-fluent-accent" />
            <span className="font-semibold text-xs">
              Add Page Note (P.{pageNumber})
            </span>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <textarea
          autoFocus
          value={commentInput}
          onChange={(e) => onChangeInput(e.target.value)}
          placeholder="Write your note or feedback here..."
          rows={3}
          className="w-full p-2.5 bg-black/5 dark:bg-white/5 border border-fluent-border-light dark:border-fluent-border-dark rounded-lg text-xs outline-none focus:border-fluent-accent resize-none text-fluent-text-primaryLight dark:text-fluent-text-primaryDark mb-3"
        />

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1 rounded text-xs hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!commentInput.trim()}
            className="px-3 py-1 bg-fluent-accent text-white rounded text-xs font-medium disabled:opacity-40 transition-opacity"
          >
            Attach Note
          </button>
        </div>
      </div>
    </div>
  );
};
