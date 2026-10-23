import React from 'react';

interface DragDropOverlayProps {
  isDragging: boolean;
}

export const DragDropOverlay: React.FC<DragDropOverlayProps> = ({ isDragging }) => {
  if (!isDragging) return null;

  return (
    <div className="absolute inset-0 bg-fluent-accent/20 backdrop-blur-sm border-2 border-dashed border-fluent-accent z-50 flex items-center justify-center pointer-events-none animate-in fade-in select-none">
      <div className="bg-fluent-card-light dark:bg-fluent-card-dark p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-3 border border-fluent-border-light dark:border-fluent-border-dark">
        <div className="w-12 h-12 rounded-full bg-fluent-accent text-white flex items-center justify-center animate-bounce shadow-lg">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <p className="font-semibold text-sm">Drop document(s) to open</p>
        <p className="text-xs opacity-60">Supports .md, .pdf, .docx, .txt, .log</p>
      </div>
    </div>
  );
};
