import React from 'react';
import { MessageSquare, X } from 'lucide-react';

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
    <div className="backdrop-blur-xs animate-in fade-in fixed inset-0 z-50 flex select-none items-center justify-center bg-black/40">
      <div className="w-80 rounded-xl border border-fluent-border-light bg-fluent-card-light p-4 shadow-2xl dark:border-fluent-border-dark dark:bg-fluent-card-dark">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-fluent-accent" />
            <span className="text-xs font-semibold">Add Page Note (P.{pageNumber})</span>
          </div>
          <button
            onClick={onCancel}
            className="rounded p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <textarea
          autoFocus
          value={commentInput}
          onChange={(e) => onChangeInput(e.target.value)}
          placeholder="Write your note or feedback here..."
          rows={3}
          className="mb-3 w-full resize-none rounded-lg border border-fluent-border-light bg-black/5 p-2.5 text-xs text-fluent-text-primaryLight outline-none focus:border-fluent-accent dark:border-fluent-border-dark dark:bg-white/5 dark:text-fluent-text-primaryDark"
        />

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded px-3 py-1 text-xs transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!commentInput.trim()}
            className="rounded bg-fluent-accent px-3 py-1 text-xs font-medium text-white transition-opacity disabled:opacity-40"
          >
            Attach Note
          </button>
        </div>
      </div>
    </div>
  );
};
