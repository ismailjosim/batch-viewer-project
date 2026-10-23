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
  currentDragBox: { x: number; y: number; width: number; height: number; pageNumber: number } | null;
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
  const [pageSize, setPageSize] = useState<{ width: number; height: number }>({ width: 595, height: 842 });
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

        setPageSize({ width: Math.floor(viewport.width), height: Math.floor(viewport.height) });

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
      className={`relative bg-white shadow-2xl rounded-xs select-none transition-shadow ${
        activeTool === 'highlight' ? 'cursor-crosshair' : activeTool === 'comment' ? 'cursor-cell' : 'cursor-default'
      }`}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />

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
            className="absolute opacity-40 hover:opacity-60 transition-opacity group pointer-events-auto cursor-pointer rounded-xs"
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
              className="absolute -top-3 -right-3 w-5 h-5 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center shadow-md transition-opacity"
            >
              <Trash2 className="w-3 h-3" />
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
          className="absolute bg-fluent-accent/30 border border-fluent-accent pointer-events-none rounded-xs"
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
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleComment(c.id);
              }}
              title={`Note by ${c.author}: ${c.text}`}
              className="w-6 h-6 rounded-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 ring-2 ring-white"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>

            {/* Comment Note Popup */}
            {activeCommentId === c.id && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute top-7 left-1/2 -translate-x-1/2 w-56 p-3 bg-fluent-card-light dark:bg-fluent-card-dark text-fluent-text-primaryLight dark:text-fluent-text-primaryDark border border-fluent-border-light dark:border-fluent-border-dark rounded-xl shadow-2xl text-xs z-30 animate-in fade-in zoom-in-95"
              >
                <div className="flex items-center justify-between mb-1.5 border-b border-fluent-border-light dark:border-fluent-border-dark pb-1">
                  <span className="font-semibold text-fluent-accent text-[11px]">{c.author}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] opacity-50">{c.createdAt}</span>
                    <button
                      onClick={() => onDeleteComment(c.id)}
                      title="Delete Comment"
                      className="p-0.5 hover:text-red-500 rounded transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <p className="text-[11px] leading-relaxed break-words">{c.text}</p>
              </div>
            )}
          </div>
        ))}
    </div>
  );
};
