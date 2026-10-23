import React from 'react';

interface DragDropOverlayProps {
  isDragging: boolean;
}

export const DragDropOverlay: React.FC<DragDropOverlayProps> = ({ isDragging }) => {
  if (!isDragging) return null;

  return (
    <div className="animate-in fade-in pointer-events-none absolute inset-0 z-50 flex select-none items-center justify-center border-2 border-dashed border-fluent-accent bg-fluent-accent/20 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-fluent-border-light bg-fluent-card-light p-6 shadow-2xl dark:border-fluent-border-dark dark:bg-fluent-card-dark">
        <div className="flex h-12 w-12 animate-bounce items-center justify-center rounded-full bg-fluent-accent text-white shadow-lg">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>
        <p className="text-sm font-semibold">Drop document(s) to open</p>
        <p className="text-xs opacity-60">Supports .md, .pdf, .docx, .txt, .log</p>
      </div>
    </div>
  );
};
