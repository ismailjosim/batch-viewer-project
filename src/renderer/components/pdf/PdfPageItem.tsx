import React, { useEffect, useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PdfHighlight, PdfComment, PdfSignature, PdfOcrWord } from '../../types';
import { MessageSquare, Trash2 } from 'lucide-react';

interface PdfPageProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  pageNumber: number;
  zoom: number;
  containerWidth: number;
  containerHeight: number;
  fitPage: boolean;
  rotation: number;
  searchQuery: string;
  activeTool:
    | 'select'
    | 'highlight'
    | 'text-highlight'
    | 'underline'
    | 'comment'
    | 'signature';
  highlightColor: string;
  highlights: PdfHighlight[];
  comments: PdfComment[];
  signatures: PdfSignature[];
  ocrWords: PdfOcrWord[];
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
  onDeleteSignature: (id: string) => void;
  setPageRef: (el: HTMLDivElement | null) => void;
}

export const PdfPageItem: React.FC<PdfPageProps> = ({
  pdfDoc,
  pageNumber,
  zoom,
  containerWidth,
  containerHeight,
  fitPage,
  rotation,
  searchQuery,
  activeTool,
  highlights,
  comments,
  signatures,
  ocrWords,
  activeCommentId,
  currentDragBox,
  onPageClick,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onDeleteHighlight,
  onToggleComment,
  onDeleteComment,
  onDeleteSignature,
  setPageRef,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const ocrLayerRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<ReturnType<pdfjsLib.PDFPageProxy['render']> | null>(null);
  const textRenderTaskRef = useRef<ReturnType<typeof pdfjsLib.renderTextLayer> | null>(null);
  const [pageSize, setPageSize] = useState<{ width: number; height: number }>({
    width: 595,
    height: 842,
  });
  const [isRendered, setIsRendered] = useState<boolean>(false);

  useEffect(() => {
    let isCancelled = false;
    const canvas = canvasRef.current;
    const textLayer = textLayerRef.current;
    if (!canvas || !textLayer || !pdfDoc) return;

    const render = async () => {
      try {
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch {}
          renderTaskRef.current = null;
        }
        textRenderTaskRef.current?.cancel();
        textRenderTaskRef.current = null;

        const page = await pdfDoc.getPage(pageNumber);
        if (isCancelled) return;

        const pageRotation = ((page.rotate + rotation) % 360 + 360) % 360;
        const unscaledViewport = page.getViewport({ scale: 1, rotation: pageRotation });
        const availableWidth = Math.max(300, (containerWidth || 800) - 80);
        const widthScale = availableWidth / unscaledViewport.width;
        const heightScale = Math.max(200, containerHeight - 140) / unscaledViewport.height;
        const fitScale = (fitPage ? Math.min(widthScale, heightScale) : widthScale) * zoom;
        const viewport = page.getViewport({ scale: fitScale, rotation: pageRotation });

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
        const textContent = await page.getTextContent();
        if (isCancelled) {
          task.cancel();
          return;
        }

        textLayer.replaceChildren();
        const textTask = pdfjsLib.renderTextLayer({
          textContentSource: textContent,
          container: textLayer,
          viewport,
          textDivs: [],
        });
        textRenderTaskRef.current = textTask;
        await Promise.all([task.promise, textTask.promise]);

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
      textRenderTaskRef.current?.cancel();
    };
  }, [pdfDoc, pageNumber, zoom, containerWidth, containerHeight, fitPage, rotation]);

  useEffect(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    const textLayers = [textLayerRef.current, ocrLayerRef.current].filter(
      (layer): layer is HTMLDivElement => Boolean(layer)
    );

    textLayers.forEach((textLayer) => {
      textLayer.querySelectorAll('span').forEach((span) => {
        span.classList.toggle(
          'pdf-search-match',
          Boolean(query && span.textContent?.toLocaleLowerCase().includes(query))
        );
      });
    });
  }, [searchQuery, isRendered, ocrWords]);

  return (
    <div
      ref={setPageRef}
      role="group"
      aria-label={`PDF page ${pageNumber}`}
      tabIndex={activeTool === 'select' ? 0 : -1}
      style={{ width: pageSize.width, height: pageSize.height }}
      onClick={(e) => onPageClick(e, pageNumber)}
      onMouseDown={(e) => onMouseDown(e, pageNumber)}
      onMouseMove={(e) => onMouseMove(e, pageNumber)}
      onMouseUp={(e) => onMouseUp(e, pageNumber)}
      className={`rounded-xs relative ${
        activeTool === 'select' || activeTool === 'text-highlight' || activeTool === 'underline'
          ? 'select-text'
          : 'select-none'
      } bg-white shadow-2xl transition-shadow ${
        activeTool === 'highlight'
          ? 'cursor-crosshair'
          : activeTool === 'comment'
            ? 'cursor-cell'
            : activeTool === 'text-highlight' || activeTool === 'underline'
              ? 'cursor-text'
            : 'cursor-default'
      }`}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
      <div
        ref={textLayerRef}
        className={`pdf-text-layer ${
          activeTool === 'select' || activeTool === 'text-highlight' || activeTool === 'underline'
            ? 'select-text'
            : 'select-none'
        }`}
        aria-label={`Selectable text on page ${pageNumber}`}
      />
      {ocrWords.length > 0 && (
        <div
          ref={ocrLayerRef}
          className="pdf-ocr-layer select-text"
          aria-label={`OCR text on page ${pageNumber}`}
        >
          {ocrWords.map((word, index) => (
            <span
              key={`${index}-${word.text}`}
              style={{
                left: `${word.xPct * 100}%`,
                top: `${word.yPct * 100}%`,
                width: `${word.widthPct * 100}%`,
                height: `${word.heightPct * 100}%`,
                fontSize: `${Math.max(8, word.heightPct * pageSize.height)}px`,
              }}
              className="pdf-ocr-word"
            >
              {word.text}
            </span>
          ))}
        </div>
      )}

      {/* Highlights Overlay */}
      {isRendered &&
        highlights.map((h) => (
          <div
            key={h.id}
            style={{
              left: `${h.xPct * 100}%`,
              top: h.style === 'underline' ? `${(h.yPct + h.heightPct) * 100}%` : `${h.yPct * 100}%`,
              width: `${h.widthPct * 100}%`,
              height: h.style === 'underline' ? '2px' : `${h.heightPct * 100}%`,
              backgroundColor: h.color,
            }}
            className="rounded-xs group pointer-events-auto absolute z-10 cursor-pointer opacity-40 transition-opacity hover:opacity-60"
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

      {signatures.map((signature) => (
        <div
          key={signature.id}
          style={{
            left: `${signature.xPct * 100}%`,
            top: `${signature.yPct * 100}%`,
            width: '35%',
          }}
          className="pointer-events-none absolute z-10"
        >
          <img
            src={signature.imageDataUrl}
            alt={`Signature: ${signature.text}`}
            className="pointer-events-none w-full"
          />
          <button
            type="button"
            onClick={() => onDeleteSignature(signature.id)}
            aria-label="Remove signature"
            className="pointer-events-auto absolute -right-2 -top-2 rounded-full bg-red-600 px-1 text-[10px] text-white"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};
