import React, { useState, useRef, useCallback, useEffect } from 'react';
import { PdfHighlight, PdfComment } from '../types';
import { AlertCircle } from 'lucide-react';
import { PdfToolbar } from './pdf/PdfToolbar';
import { PdfPageItem } from './pdf/PdfPageItem';
import { PdfNotesDrawer } from './pdf/PdfNotesDrawer';
import { PdfCommentModal } from './pdf/PdfCommentModal';
import { usePdfDocument } from './pdf/usePdfDocument';

interface PdfViewerProps {
  base64Data: string;
  filePath: string | null;
  highlights: PdfHighlight[];
  comments: PdfComment[];
  zoom: number;
  onAnnotationsChange: (highlights: PdfHighlight[], comments: PdfComment[]) => void;
  onSavePdf: (newBase64: string) => Promise<void>;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  base64Data,
  highlights,
  comments,
  zoom,
  onAnnotationsChange,
  onSavePdf,
}) => {
  const {
    pdfDoc,
    numPages,
    isLoading,
    loadError,
    isSaving,
    saveSuccess,
    handleSaveWithAnnotations,
  } = usePdfDocument({ base64Data, highlights, comments, onSavePdf });

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageInput, setPageInput] = useState<string>('1');
  const [activeTool, setActiveTool] = useState<'select' | 'highlight' | 'comment'>('select');
  const [highlightColor, setHighlightColor] = useState<string>('#ffe066');
  const [isNotesDrawerOpen, setIsNotesDrawerOpen] = useState<boolean>(false);
  const [containerWidth, setContainerWidth] = useState<number>(800);

  // New comment dialog state
  const [pendingComment, setPendingComment] = useState<{ pageNumber: number; xPct: number; yPct: number } | null>(null);
  const [commentInput, setCommentInput] = useState<string>('');
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);

  // Highlight drawing state
  const [dragStart, setDragStart] = useState<{ x: number; y: number; pageNumber: number } | null>(null);
  const [currentDragBox, setCurrentDragBox] = useState<{ x: number; y: number; width: number; height: number; pageNumber: number } | null>(null);

  const pagesContainerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Monitor container width dynamically
  useEffect(() => {
    const el = pagesContainerRef.current;
    if (!el) return;
    const updateSize = () => {
      if (el.clientWidth > 0) setContainerWidth(el.clientWidth);
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Monitor scroll position to update current page
  const handleScroll = useCallback(() => {
    const container = pagesContainerRef.current;
    if (!container) return;
    const containerTop = container.scrollTop;

    for (let i = 0; i < pageRefs.current.length; i++) {
      const pageEl = pageRefs.current[i];
      if (pageEl) {
        const top = pageEl.offsetTop - container.offsetTop;
        const height = pageEl.offsetHeight;
        if (containerTop >= top - 100 && containerTop < top + height - 100) {
          const nextP = i + 1;
          setCurrentPage(nextP);
          setPageInput(String(nextP));
          break;
        }
      }
    }
  }, []);

  const scrollToPage = (pageNum: number) => {
    const target = pageRefs.current[pageNum - 1];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setCurrentPage(pageNum);
      setPageInput(String(pageNum));
    }
  };

  const handlePageInputCommit = () => {
    const val = parseInt(pageInput, 10);
    if (!isNaN(val) && val >= 1 && val <= (numPages || 1)) {
      scrollToPage(val);
    } else {
      setPageInput(String(currentPage));
    }
  };

  // Drag-to-Highlight handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, pageNumber: number) => {
    if (activeTool === 'highlight') {
      const rect = e.currentTarget.getBoundingClientRect();
      setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top, pageNumber });
      setCurrentDragBox({ x: e.clientX - rect.left, y: e.clientY - rect.top, width: 0, height: 0, pageNumber });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, pageNumber: number) => {
    if (activeTool === 'highlight' && dragStart && dragStart.pageNumber === pageNumber) {
      const rect = e.currentTarget.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;
      const x = Math.min(dragStart.x, currentX);
      const y = Math.min(dragStart.y, currentY);
      const width = Math.abs(currentX - dragStart.x);
      const height = Math.abs(currentY - dragStart.y);
      setCurrentDragBox({ x, y, width, height, pageNumber });
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>, pageNumber: number) => {
    if (activeTool === 'highlight' && dragStart && currentDragBox && currentDragBox.pageNumber === pageNumber) {
      const rect = e.currentTarget.getBoundingClientRect();
      if (currentDragBox.width > 5 && currentDragBox.height > 5) {
        const newHighlight: PdfHighlight = {
          id: `hl-${Date.now()}`,
          pageNumber,
          xPct: currentDragBox.x / rect.width,
          yPct: currentDragBox.y / rect.height,
          widthPct: currentDragBox.width / rect.width,
          heightPct: currentDragBox.height / rect.height,
          color: highlightColor,
        };
        onAnnotationsChange([...highlights, newHighlight], comments);
      }
      setDragStart(null);
      setCurrentDragBox(null);
    }
  };

  // Comments handlers
  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>, pageNumber: number) => {
    if (activeTool === 'comment') {
      const rect = e.currentTarget.getBoundingClientRect();
      setPendingComment({
        pageNumber,
        xPct: (e.clientX - rect.left) / rect.width,
        yPct: (e.clientY - rect.top) / rect.height,
      });
      setCommentInput('');
    }
  };

  const submitComment = () => {
    if (!pendingComment || !commentInput.trim()) {
      setPendingComment(null);
      return;
    }
    const newComment: PdfComment = {
      id: `cm-${Date.now()}`,
      pageNumber: pendingComment.pageNumber,
      xPct: pendingComment.xPct,
      yPct: pendingComment.yPct,
      text: commentInput.trim(),
      author: 'You',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    onAnnotationsChange(highlights, [...comments, newComment]);
    setPendingComment(null);
    setCommentInput('');
  };

  const deleteHighlight = (id: string) => {
    onAnnotationsChange(highlights.filter((h) => h.id !== id), comments);
  };

  const deleteComment = (id: string) => {
    onAnnotationsChange(highlights, comments.filter((c) => c.id !== id));
  };

  // Keyboard shortcut Ctrl + S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveWithAnnotations();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSaveWithAnnotations]);

  return (
    <div className="flex-1 h-full flex flex-col bg-[#383a3f] dark:bg-[#18191c] overflow-hidden select-none">
      <PdfToolbar
        currentPage={currentPage}
        numPages={numPages}
        pageInput={pageInput}
        isLoading={isLoading}
        activeTool={activeTool}
        highlightColor={highlightColor}
        isNotesDrawerOpen={isNotesDrawerOpen}
        totalAnnotations={highlights.length + comments.length}
        isSaving={isSaving}
        saveSuccess={saveSuccess}
        onPageInputChange={setPageInput}
        onPageInputCommit={handlePageInputCommit}
        onPrevPage={() => scrollToPage(Math.max(1, currentPage - 1))}
        onNextPage={() => scrollToPage(Math.min(numPages, currentPage + 1))}
        onSelectTool={setActiveTool}
        onSelectColor={setHighlightColor}
        onToggleNotesDrawer={() => setIsNotesDrawerOpen(!isNotesDrawerOpen)}
        onSave={handleSaveWithAnnotations}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <div
          ref={pagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto overflow-x-auto p-8 flex flex-col items-center gap-8 relative"
        >
          {isLoading && (
            <div className="flex-1 flex flex-col items-center justify-center text-white/70 gap-3 py-20">
              <div className="w-8 h-8 border-3 border-fluent-accent border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">Rendering PDF pages...</span>
            </div>
          )}

          {loadError && (
            <div className="flex-1 flex flex-col items-center justify-center text-red-400 gap-3 p-8 text-center py-20 bg-black/20 rounded-xl my-8">
              <AlertCircle className="w-10 h-10 text-red-400 opacity-80" />
              <span className="text-base font-semibold">Unable to display PDF</span>
              <p className="text-xs opacity-75 max-w-md bg-black/30 p-3 rounded font-mono">{loadError}</p>
            </div>
          )}

          {!isLoading &&
            !loadError &&
            pdfDoc &&
            Array.from({ length: numPages }).map((_, index) => {
              const pageNum = index + 1;
              return (
                <PdfPageItem
                  key={pageNum}
                  pdfDoc={pdfDoc}
                  pageNumber={pageNum}
                  zoom={zoom}
                  containerWidth={containerWidth}
                  activeTool={activeTool}
                  highlightColor={highlightColor}
                  highlights={highlights.filter((h) => h.pageNumber === pageNum)}
                  comments={comments.filter((c) => c.pageNumber === pageNum)}
                  activeCommentId={activeCommentId}
                  currentDragBox={currentDragBox}
                  onPageClick={handlePageClick}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onDeleteHighlight={deleteHighlight}
                  onToggleComment={(id) => setActiveCommentId(activeCommentId === id ? null : id)}
                  onDeleteComment={deleteComment}
                  setPageRef={(el) => (pageRefs.current[index] = el)}
                />
              );
            })}
        </div>

        <PdfNotesDrawer
          isOpen={isNotesDrawerOpen}
          highlights={highlights}
          comments={comments}
          onClose={() => setIsNotesDrawerOpen(false)}
          onSelectPage={scrollToPage}
          onSelectComment={(id, pageNum) => {
            scrollToPage(pageNum);
            setActiveCommentId(id);
          }}
          onDeleteHighlight={deleteHighlight}
          onDeleteComment={deleteComment}
        />
      </div>

      {pendingComment && (
        <PdfCommentModal
          pageNumber={pendingComment.pageNumber}
          commentInput={commentInput}
          onChangeInput={setCommentInput}
          onSubmit={submitComment}
          onCancel={() => setPendingComment(null)}
        />
      )}
    </div>
  );
};
