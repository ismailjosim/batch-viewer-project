import React, { useEffect, useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PdfHighlight, PdfComment } from '../../types';
import { MessageSquare, Trash2 } from 'lucide-react';

interface PdfPageProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  pageNumber: number;
  zoom: number;
  containerWidth: number;
  activeTool: 'select' | 'highlight' | 'comment';
  highlightColor: string;
  highlights: PdfHighlight[];
  comments: PdfComment[];
  activeCommentId: string | null;
  currentDragBox: {
    x: number;
    y: number;
    width: number;
    height: number;
    pageNumber: number;
  } | null;
  onPageClick: (e: React.MouseEvent<HTMLDivElement>, pageNumber: number) => void;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>, pageNumber: number) => void;
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>, pageNumber: number) => void;
  onMouseUp: (e: React.MouseEvent<HTMLDivElement>, pageNumber: number) => void;
  onDeleteHighlight: (id: string) => void;
  onToggleComment: (id: string) => void;
  onDeleteComment: (id: string) => void;
  setPageRef: (el: HTMLDivElement | null) => void;
}

export const PdfPageItem: React.FC<PdfPageProps> = ({
  pdfDoc,
  pageNumber,
  zoom,
  containerWidth,
  activeTool,
  highlights,
  comments,
  activeCommentId,
  currentDragBox,
  onPageClick,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onDeleteHighlight,
  onToggleComment,
  onDeleteComment,
  setPageRef,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);
  const [pageSize, setPageSize] = useState<{ width: number; height: number }>({
    width: 595,
    height: 842,
  });
  const [isRendered, setIsRendered] = useState<boolean>(false);

  useEffect(() => {
    let isCancelled = false;
    const canvas = canvasRef.current;
    if (!canvas || !pdfDoc) return;

    const render = async () => {
      try {
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch {}
          renderTaskRef.current = null;
        }

        const page = await pdfDoc.getPage(pageNumber);
        if (isCancelled) return;

        const unscaledViewport = page.getViewport({ scale: 1 });
        const availableWidth = Math.max(300, (containerWidth || 800) - 80);
        const fitScale = (availableWidth / unscaledViewport.width) * zoom;
        const viewport = page.getViewport({ scale: fitScale });

        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        setPageSize({
          width: Math.floor(viewport.width),
          height: Math.floor(viewport.height),
        });

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
        };

        const task = page.render(renderContext);
        renderTaskRef.current = task;
        await task.promise;

        if (!isCancelled) {
          setIsRendered(true);
        }
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.error(`Page ${pageNumber} render error:`, err);
        }
      }
    };

    render();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {}
      }
    };
  }, [pdfDoc, pageNumber, zoom, containerWidth]);

  return (
    <div
      ref={setPageRef}
      style={{ width: pageSize.width, height: pageSize.height }}
      onClick={(e) => onPageClick(e, pageNumber)}
      onMouseDown={(e) => onMouseDown(e, pageNumber)}
      onMouseMove={(e) => onMouseMove(e, pageNumber)}
      onMouseUp={(e) => onMouseUp(e, pageNumber)}
      className={`rounded-xs relative select-none bg-white shadow-2xl transition-shadow ${
        activeTool === 'highlight'
          ? 'cursor-crosshair'
          : activeTool === 'comment'
            ? 'cursor-cell'
            : 'cursor-default'
      }`}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />

      {/* Highlights Overlay */}
      {isRendered &&
        highlights.map((h) => (
          <div
            key={h.id}
            style={{
              left: `${h.xPct * 100}%`,
              top: `${h.yPct * 100}%`,
              width: `${h.widthPct * 100}%`,
              height: `${h.heightPct * 100}%`,
              backgroundColor: h.color,
            }}
            className="rounded-xs group pointer-events-auto absolute cursor-pointer opacity-40 transition-opacity hover:opacity-60"
            title="Click to remove highlight"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteHighlight(h.id);
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteHighlight(h.id);
              }}
              className="absolute -right-3 -top-3 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}

      {/* Dragging Highlight Preview */}
      {currentDragBox && currentDragBox.pageNumber === pageNumber && (
        <div
          style={{
            left: currentDragBox.x,
            top: currentDragBox.y,
            width: currentDragBox.width,
            height: currentDragBox.height,
          }}
          className="rounded-xs pointer-events-none absolute border border-fluent-accent bg-fluent-accent/30"
        />
      )}

      {/* Comments Pins */}
      {isRendered &&
        comments.map((c) => (
          <div
            key={c.id}
            style={{
              left: `${c.xPct * 100}%`,
              top: `${c.yPct * 100}%`,
            }}
            className="pointer-events-auto absolute z-20 -translate-x-1/2 -translate-y-1/2"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleComment(c.id);
              }}
              title={`Note by ${c.author}: ${c.text}`}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white shadow-lg ring-2 ring-white transition-transform hover:scale-110 hover:bg-amber-600"
            >
              <MessageSquare className="h-3.5 w-3.5" />
            </button>

            {/* Comment Note Popup */}
            {activeCommentId === c.id && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="animate-in fade-in zoom-in-95 absolute left-1/2 top-7 z-30 w-56 -translate-x-1/2 rounded-xl border border-fluent-border-light bg-fluent-card-light p-3 text-xs text-fluent-text-primaryLight shadow-2xl dark:border-fluent-border-dark dark:bg-fluent-card-dark dark:text-fluent-text-primaryDark"
              >
                <div className="mb-1.5 flex items-center justify-between border-b border-fluent-border-light pb-1 dark:border-fluent-border-dark">
                  <span className="text-[11px] font-semibold text-fluent-accent">{c.author}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] opacity-50">{c.createdAt}</span>
                    <button
                      onClick={() => onDeleteComment(c.id)}
                      title="Delete Comment"
                      className="rounded p-0.5 transition-colors hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <p className="break-words text-[11px] leading-relaxed">{c.text}</p>
              </div>
            )}
          </div>
        ))}
    </div>
  );
};
