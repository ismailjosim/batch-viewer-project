import React, { useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Bookmark, FileText, X } from 'lucide-react';

export interface PdfBookmark {
  id: string;
  pageNumber: number;
  label: string;
}

interface PdfNavigationSidebarProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  numPages: number;
  bookmarks: PdfBookmark[];
  onSelectPage: (pageNumber: number) => void;
  onRemoveBookmark: (bookmarkId: string) => void;
  onClose: () => void;
}

const PageThumbnail: React.FC<{
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  pageNumber: number;
  onSelect: () => void;
}> = ({ pdfDoc, pageNumber, onSelect }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let renderTask: ReturnType<pdfjsLib.PDFPageProxy['render']> | null = null;
    let isCancelled = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting) || canvas.dataset.rendered) return;

        pdfDoc
          .getPage(pageNumber)
          .then((page) => {
            if (isCancelled) return;
            const viewport = page.getViewport({ scale: 0.18 });
            canvas.width = Math.ceil(viewport.width);
            canvas.height = Math.ceil(viewport.height);
            canvas.style.width = `${Math.ceil(viewport.width)}px`;
            canvas.style.height = `${Math.ceil(viewport.height)}px`;
            const context = canvas.getContext('2d');
            if (!context) throw new Error('Unable to render PDF thumbnail');
            renderTask = page.render({ canvasContext: context, viewport });
            return renderTask.promise;
          })
          .then(() => {
            if (!isCancelled) canvas.dataset.rendered = 'true';
          })
          .catch((error: unknown) => {
            if (!isCancelled) console.error(`Page ${pageNumber} thumbnail error:`, error);
          });
      },
      { rootMargin: '200px' }
    );
    observer.observe(container);

    return () => {
      isCancelled = true;
      observer.disconnect();
      renderTask?.cancel();
    };
  }, [pageNumber, pdfDoc]);

  return (
    <button
      ref={containerRef}
      type="button"
      onClick={onSelect}
      aria-label={`Go to page ${pageNumber}`}
      className="flex w-full flex-col items-center gap-1 rounded-lg border border-transparent p-2 text-[11px] transition-colors hover:border-fluent-accent/50 hover:bg-black/5 dark:hover:bg-white/5"
    >
      <canvas ref={canvasRef} className="max-w-full rounded-sm bg-white shadow" />
      <span>Page {pageNumber}</span>
    </button>
  );
};

export const PdfNavigationSidebar: React.FC<PdfNavigationSidebarProps> = ({
  pdfDoc,
  numPages,
  bookmarks,
  onSelectPage,
  onRemoveBookmark,
  onClose,
}) => (
  <aside className="pdf-navigation-sidebar z-30 flex h-full w-60 shrink-0 flex-col border-r border-fluent-border-light bg-fluent-card-light/95 text-xs dark:border-fluent-border-dark dark:bg-fluent-card-dark/95">
    <div className="flex items-center justify-between border-b border-fluent-border-light p-3 font-semibold dark:border-fluent-border-dark">
      <span>Pages & Bookmarks</span>
      <button type="button" onClick={onClose} aria-label="Close navigation" title="Close">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
    <div className="border-b border-fluent-border-light p-2 dark:border-fluent-border-dark">
      <div className="mb-1 flex items-center gap-1.5 px-1 font-semibold">
        <FileText className="h-3.5 w-3.5" />
        <span>Pages ({numPages})</span>
      </div>
      <div className="grid max-h-60 grid-cols-2 gap-1 overflow-y-auto">
        {Array.from({ length: numPages }, (_, index) => {
          const pageNumber = index + 1;
          return (
            <PageThumbnail
              key={pageNumber}
              pdfDoc={pdfDoc}
              pageNumber={pageNumber}
              onSelect={() => onSelectPage(pageNumber)}
            />
          );
        })}
      </div>
    </div>
    <div className="flex-1 overflow-y-auto p-2">
      <div className="mb-1 flex items-center gap-1.5 px-1 font-semibold">
        <Bookmark className="h-3.5 w-3.5" />
        <span>Bookmarks ({bookmarks.length})</span>
      </div>
      {bookmarks.length === 0 ? (
        <p className="px-1 py-2 text-[11px] opacity-60">No bookmarks yet.</p>
      ) : (
        bookmarks.map((bookmark) => (
          <div
            key={bookmark.id}
            className="group flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-black/5 dark:hover:bg-white/5"
          >
            <button
              type="button"
              onClick={() => onSelectPage(bookmark.pageNumber)}
              className="min-w-0 flex-1 truncate text-left"
            >
              {bookmark.label} <span className="opacity-60">· p.{bookmark.pageNumber}</span>
            </button>
            <button
              type="button"
              onClick={() => onRemoveBookmark(bookmark.id)}
              aria-label={`Remove bookmark ${bookmark.label}`}
              className="ml-1 opacity-0 group-hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))
      )}
    </div>
  </aside>
);
