import React, { useState, useRef, useCallback, useEffect } from 'react';
import { PdfHighlight, PdfComment, PdfSignature } from '../types';
import { AlertCircle } from 'lucide-react';
import { PdfToolbar } from './pdf/PdfToolbar';
import { PdfPageItem } from './pdf/PdfPageItem';
import { PdfNotesDrawer } from './pdf/PdfNotesDrawer';
import { PdfCommentModal } from './pdf/PdfCommentModal';
import { usePdfDocument } from './pdf/usePdfDocument';
import { PdfNavigationSidebar, PdfBookmark } from './pdf/PdfNavigationSidebar';
import { PdfSearchPanel, PdfSearchResult } from './pdf/PdfSearchPanel';
import { PdfDocumentTools } from './pdf/PdfDocumentTools';
import Tesseract from 'tesseract.js';
import { PdfOcrWord } from '../types';

interface PdfViewerProps {
  base64Data: string;
  filePath: string | null;
  highlights: PdfHighlight[];
  comments: PdfComment[];
  zoom: number;
  onAnnotationsChange: (highlights: PdfHighlight[], comments: PdfComment[]) => void;
  onPdfDocumentChange: (base64: string, pageOrder?: number[]) => void;
  signatures: PdfSignature[];
  rotation: number;
  onPdfSignaturesChange: (signatures: PdfSignature[]) => void;
  onPdfRotationChange: (rotation: number) => void;
  onSavePdf: (newBase64: string) => Promise<boolean>;
  onNotify: (message: string) => void;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  base64Data,
  filePath,
  highlights,
  comments,
  zoom,
  onAnnotationsChange,
  onPdfDocumentChange,
  signatures,
  rotation,
  onPdfSignaturesChange,
  onPdfRotationChange,
  onSavePdf,
  onNotify,
}) => {
  const [signatureText, setSignatureText] = useState<string | null>(null);
  const [ocrWordsByPage, setOcrWordsByPage] = useState<Record<number, PdfOcrWord[]>>({});
  const [searchIndexVersion, setSearchIndexVersion] = useState<number>(0);
  const {
    pdfDoc,
    numPages,
    isLoading,
    loadError,
    isSaving,
    saveSuccess,
    handleSaveWithAnnotations,
  } = usePdfDocument({ base64Data, highlights, comments, signatures, rotation, onSavePdf });

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageInput, setPageInput] = useState<string>('1');
  const [activeTool, setActiveTool] = useState<
    'select' | 'highlight' | 'text-highlight' | 'underline' | 'comment' | 'signature'
  >('select');
  const [highlightColor, setHighlightColor] = useState<string>('#ffe066');
  const [isNotesDrawerOpen, setIsNotesDrawerOpen] = useState<boolean>(false);
  const [isNavigationOpen, setIsNavigationOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<PdfSearchResult[]>([]);
  const [searchResultIndex, setSearchResultIndex] = useState<number>(0);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [fitPage, setFitPage] = useState<boolean>(false);
  const [containerHeight, setContainerHeight] = useState<number>(700);
  const [bookmarks, setBookmarks] = useState<PdfBookmark[]>([]);
  const [bookmarksStorageKeyLoaded, setBookmarksStorageKeyLoaded] = useState<string | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(800);
  const textIndexRef = useRef<Map<number, string>>(new Map());
  const ocrTextRef = useRef<Map<number, string>>(new Map());
  const annotationUndoRef = useRef<Array<{ highlights: PdfHighlight[]; comments: PdfComment[] }>>([]);
  const annotationRedoRef = useRef<Array<{ highlights: PdfHighlight[]; comments: PdfComment[] }>>([]);
  const [annotationHistoryVersion, setAnnotationHistoryVersion] = useState<number>(0);

  // New comment dialog state
  const [pendingComment, setPendingComment] = useState<{
    pageNumber: number;
    xPct: number;
    yPct: number;
  } | null>(null);
  const [commentInput, setCommentInput] = useState<string>('');
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);

  // Highlight drawing state
  const [dragStart, setDragStart] = useState<{
    x: number;
    y: number;
    pageNumber: number;
  } | null>(null);
  const [currentDragBox, setCurrentDragBox] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
    pageNumber: number;
  } | null>(null);

  const pagesContainerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const scrollToPage = useCallback((pageNum: number) => {
    const target = pageRefs.current[pageNum - 1];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setCurrentPage(pageNum);
      setPageInput(String(pageNum));
    }
  }, []);

  const updateAnnotations = (nextHighlights: PdfHighlight[], nextComments: PdfComment[]) => {
    annotationUndoRef.current = [...annotationUndoRef.current, { highlights, comments }].slice(-50);
    annotationRedoRef.current = [];
    setAnnotationHistoryVersion((version) => version + 1);
    onAnnotationsChange(nextHighlights, nextComments);
  };

  const undoAnnotations = useCallback(() => {
    const previous = annotationUndoRef.current.pop();
    if (!previous) return;
    annotationRedoRef.current.push({ highlights, comments });
    setAnnotationHistoryVersion((version) => version + 1);
    onAnnotationsChange(previous.highlights, previous.comments);
  }, [comments, highlights, onAnnotationsChange]);

  const redoAnnotations = useCallback(() => {
    const next = annotationRedoRef.current.pop();
    if (!next) return;
    annotationUndoRef.current.push({ highlights, comments });
    setAnnotationHistoryVersion((version) => version + 1);
    onAnnotationsChange(next.highlights, next.comments);
  }, [comments, highlights, onAnnotationsChange]);

  // Monitor container width dynamically
  useEffect(() => {
    const el = pagesContainerRef.current;
    if (!el) return;
    const updateSize = () => {
      if (el.clientWidth > 0) setContainerWidth(el.clientWidth);
      if (el.clientHeight > 0) setContainerHeight(el.clientHeight);
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const bookmarkStorageKey = `batch-viewer:pdf-bookmarks:${filePath || 'untitled'}`;
  useEffect(() => {
    try {
      const saved = localStorage.getItem(bookmarkStorageKey);
      const parsed: unknown = saved ? JSON.parse(saved) : [];
      if (Array.isArray(parsed)) {
        setBookmarks(
          parsed.filter(
            (item): item is PdfBookmark =>
              typeof item?.id === 'string' &&
              typeof item?.label === 'string' &&
              Number.isInteger(item?.pageNumber)
          )
        );
      } else {
        setBookmarks([]);
      }
      setBookmarksStorageKeyLoaded(bookmarkStorageKey);
    } catch (error) {
      console.error('Failed to load PDF bookmarks:', error);
      setBookmarks([]);
      setBookmarksStorageKeyLoaded(bookmarkStorageKey);
    }
  }, [bookmarkStorageKey]);

  useEffect(() => {
    if (bookmarksStorageKeyLoaded !== bookmarkStorageKey) return;
    try {
      localStorage.setItem(bookmarkStorageKey, JSON.stringify(bookmarks));
    } catch (error) {
      console.error('Failed to save PDF bookmarks:', error);
    }
  }, [bookmarkStorageKey, bookmarks, bookmarksStorageKeyLoaded]);

  useEffect(() => {
    textIndexRef.current.clear();
  }, [pdfDoc]);

  useEffect(() => {
    textIndexRef.current.clear();
    ocrTextRef.current.clear();
    setOcrWordsByPage({});
  }, [base64Data]);

  useEffect(() => {
    let isCancelled = false;
    const query = searchQuery.trim().toLocaleLowerCase();
    if (!pdfDoc || !query) {
      setSearchResults([]);
      setSearchResultIndex(0);
      setIsSearching(false);
      return;
    }

    const search = async () => {
      setIsSearching(true);
      const results: PdfSearchResult[] = [];
      for (let pageNumber = 1; pageNumber <= numPages; pageNumber += 1) {
        let text = textIndexRef.current.get(pageNumber);
        if (text === undefined) {
          const page = await pdfDoc.getPage(pageNumber);
          const content = await page.getTextContent();
          text = content.items
            .map((item) => ('str' in item ? item.str : ''))
            .join(' ')
            .replace(/\s+/g, ' ');
          textIndexRef.current.set(pageNumber, text);
        }
        text = [text, ocrTextRef.current.get(pageNumber)].filter(Boolean).join(' ');
        const normalizedText = text.toLocaleLowerCase();
        const firstMatch = normalizedText.indexOf(query);
        if (firstMatch < 0) continue;

        let count = 0;
        let offset = 0;
        while ((offset = normalizedText.indexOf(query, offset)) !== -1) {
          count += 1;
          offset += query.length;
        }
        const snippetStart = Math.max(0, firstMatch - 45);
        const snippetEnd = Math.min(text.length, firstMatch + query.length + 65);
        results.push({
          pageNumber,
          count,
          snippet: `${snippetStart > 0 ? '…' : ''}${text.slice(snippetStart, snippetEnd)}${snippetEnd < text.length ? '…' : ''}`,
        });
      }
      if (!isCancelled) {
        setSearchResults(results);
        setSearchResultIndex(0);
        setIsSearching(false);
        if (results.length) scrollToPage(results[0].pageNumber);
      }
    };

    search().catch((error: unknown) => {
      if (!isCancelled) {
        console.error('Failed to search PDF text:', error);
        setSearchResults([]);
        setIsSearching(false);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [numPages, pdfDoc, searchQuery, scrollToPage, searchIndexVersion]);

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

  const selectSearchResult = (index: number) => {
    if (searchResults.length === 0) return;
    const normalizedIndex = (index + searchResults.length) % searchResults.length;
    setSearchResultIndex(normalizedIndex);
    scrollToPage(searchResults[normalizedIndex].pageNumber);
  };

  const addBookmark = () => {
    const label = window.prompt('Name this bookmark', `Page ${currentPage}`)?.trim();
    if (!label) return;
    setBookmarks((current) => [
      ...current,
      { id: `bm-${Date.now()}`, pageNumber: currentPage, label },
    ]);
  };

  const handleDocumentChange = (updatedBase64: string, pageOrder?: number[]) => {
    onPdfDocumentChange(updatedBase64, pageOrder);
    if (!pageOrder) return;
    setBookmarks((current) =>
      current.flatMap((bookmark) => {
        const index = pageOrder.indexOf(bookmark.pageNumber);
        return index < 0 ? [] : [{ ...bookmark, pageNumber: index + 1 }];
      })
    );
    onPdfSignaturesChange(
      signatures.flatMap((signature) => {
        const index = pageOrder.indexOf(signature.pageNumber);
        return index < 0 ? [] : [{ ...signature, pageNumber: index + 1 }];
      })
    );
  };

  const runOcr = async (language: string) => {
    if (!pdfDoc || isLoading) {
      onNotify('The PDF is not ready for OCR yet.');
      return;
    }

    let worker: Tesseract.Worker | null = null;
    try {
      onNotify('OCR started. The PDF is processed locally; language data may download on first use.');
      worker = await Tesseract.createWorker(language, 1);
      const recognizedWords: Record<number, PdfOcrWord[]> = {};

      for (let pageNumber = 1; pageNumber <= numPages; pageNumber += 1) {
        const page = await pdfDoc.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1.75 });
        const canvas = document.createElement('canvas');
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const context = canvas.getContext('2d');
        if (!context) throw new Error(`Could not create OCR canvas for page ${pageNumber}.`);
        await page.render({ canvasContext: context, viewport }).promise;
        const result = await worker.recognize(canvas);
        ocrTextRef.current.set(pageNumber, result.data.text);
        const words =
          result.data.blocks?.flatMap((block) =>
            block.paragraphs.flatMap((paragraph) =>
              paragraph.lines.flatMap((line) => line.words)
            )
          ) || [];
        recognizedWords[pageNumber] = words
          .filter((word) => word.text.trim() && word.confidence >= 20)
          .map((word) => ({
            text: word.text,
            xPct: word.bbox.x0 / canvas.width,
            yPct: word.bbox.y0 / canvas.height,
            widthPct: (word.bbox.x1 - word.bbox.x0) / canvas.width,
            heightPct: (word.bbox.y1 - word.bbox.y0) / canvas.height,
          }));
        canvas.width = 0;
        canvas.height = 0;
      }

      setOcrWordsByPage((current) => ({ ...current, ...recognizedWords }));
      setSearchIndexVersion((version) => version + 1);
      onNotify(
        `OCR complete for ${numPages} pages. Text is searchable and selectable; your PDF stayed on this device.`
      );
    } catch (error) {
      console.error('PDF OCR failed:', error);
      onNotify(`OCR failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      await worker?.terminate();
    }
  };

  const savePdf = useCallback(async () => {
    await handleSaveWithAnnotations();
  }, [handleSaveWithAnnotations]);

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
    if (activeTool !== 'highlight') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setDragStart({ x, y, pageNumber });
    setCurrentDragBox({ x, y, width: 0, height: 0, pageNumber });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, pageNumber: number) => {
    if (activeTool !== 'highlight' || !dragStart || dragStart.pageNumber !== pageNumber) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const curX = e.clientX - rect.left;
    const curY = e.clientY - rect.top;
    setCurrentDragBox({
      x: Math.min(dragStart.x, curX),
      y: Math.min(dragStart.y, curY),
      width: Math.abs(curX - dragStart.x),
      height: Math.abs(curY - dragStart.y),
      pageNumber,
    });
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>, pageNumber: number) => {
    if (activeTool === 'highlight' && dragStart && currentDragBox?.pageNumber === pageNumber) {
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
        updateAnnotations([...highlights, newHighlight], comments);
      }
      setDragStart(null);
      setCurrentDragBox(null);
      return;
    }

    if (activeTool === 'text-highlight' || activeTool === 'underline') {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();
      if (!selection || !selectedText || selection.rangeCount === 0) return;

      const rectangles = Array.from(selection.getRangeAt(0).getClientRects());
      const newHighlights: PdfHighlight[] = [];
      rectangles.forEach((selectionRect, rectIndex) => {
        pageRefs.current.forEach((pageElement, pageIndex) => {
          if (!pageElement) return;
          const pageRect = pageElement.getBoundingClientRect();
          const left = Math.max(selectionRect.left, pageRect.left);
          const right = Math.min(selectionRect.right, pageRect.right);
          const top = Math.max(selectionRect.top, pageRect.top);
          const bottom = Math.min(selectionRect.bottom, pageRect.bottom);
          if (right <= left || bottom <= top) return;
          newHighlights.push({
            id: `hl-${Date.now()}-${rectIndex}-${pageIndex}`,
            pageNumber: pageIndex + 1,
            xPct: (left - pageRect.left) / pageRect.width,
            yPct: (top - pageRect.top) / pageRect.height,
            widthPct: (right - left) / pageRect.width,
            heightPct: (bottom - top) / pageRect.height,
            color: highlightColor,
            text: selectedText,
            style: activeTool === 'underline' ? 'underline' : 'highlight',
          });
        });
      });
      if (newHighlights.length) {
        updateAnnotations([...highlights, ...newHighlights], comments);
        selection.removeAllRanges();
      }
    }
  };

  // Comments handlers
  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>, pageNumber: number) => {
    if (activeTool === 'signature' && signatureText) {
      const rect = e.currentTarget.getBoundingClientRect();
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 150;
      const context = canvas.getContext('2d');
      if (!context) {
        onNotify('Unable to prepare signature image.');
        return;
      }
      context.font = 'italic 72px "Segoe UI", cursive';
      context.fillStyle = '#172554';
      context.textBaseline = 'middle';
      context.fillText(signatureText, 12, 75, 770);
      onPdfSignaturesChange([
        ...signatures,
        {
          id: `sig-${Date.now()}`,
          pageNumber,
          xPct: (e.clientX - rect.left) / rect.width,
          yPct: (e.clientY - rect.top) / rect.height,
          text: signatureText,
          imageDataUrl: canvas.toDataURL('image/png'),
        },
      ]);
      setSignatureText(null);
      setActiveTool('select');
      return;
    }
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
      createdAt: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    updateAnnotations(highlights, [...comments, newComment]);
    setPendingComment(null);
    setCommentInput('');
  };

  const deleteHighlight = (id: string) =>
    updateAnnotations(
      highlights.filter((h) => h.id !== id),
      comments
    );
  const deleteComment = (id: string) =>
    updateAnnotations(
      highlights,
      comments.filter((c) => c.id !== id)
    );

  // Keyboard shortcut Ctrl + S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
      ) {
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        e.stopPropagation();
        setIsSearchOpen(true);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        savePdf();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redoAnnotations();
        else undoAnnotations();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redoAnnotations();
      } else if (e.key === 'PageDown' || e.key === 'ArrowDown') {
        e.preventDefault();
        scrollToPage(Math.min(numPages, currentPage + 1));
      } else if (e.key === 'PageUp' || e.key === 'ArrowUp') {
        e.preventDefault();
        scrollToPage(Math.max(1, currentPage - 1));
      } else if (e.key === 'Home') {
        e.preventDefault();
        scrollToPage(1);
      } else if (e.key === 'End') {
        e.preventDefault();
        scrollToPage(numPages);
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [currentPage, numPages, redoAnnotations, savePdf, scrollToPage, undoAnnotations]);

  return (
    <div className="flex h-full flex-1 select-none flex-col overflow-hidden bg-[#383a3f] dark:bg-[#18191c]">
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
        isNavigationOpen={isNavigationOpen}
        isSearchOpen={isSearchOpen}
        fitPage={fitPage}
        canUndo={annotationHistoryVersion > 0 && annotationUndoRef.current.length > 0}
        canRedo={annotationHistoryVersion > 0 && annotationRedoRef.current.length > 0}
        documentTools={
          <PdfDocumentTools
            base64Data={base64Data}
            filePath={filePath}
            numPages={numPages}
            onDocumentChange={handleDocumentChange}
            onBeginSignature={(value) => {
              setSignatureText(value);
              setActiveTool('signature');
              onNotify('Click on the PDF page to place the typed signature.');
            }}
            onRunOcr={runOcr}
            onNotify={onNotify}
          />
        }
        onPageInputChange={setPageInput}
        onPageInputCommit={handlePageInputCommit}
        onPrevPage={() => scrollToPage(Math.max(1, currentPage - 1))}
        onNextPage={() => scrollToPage(Math.min(numPages, currentPage + 1))}
        onSelectTool={(tool) => {
          setActiveTool(tool);
          if (tool !== 'signature') setSignatureText(null);
        }}
        onSelectColor={setHighlightColor}
        onToggleNotesDrawer={() => setIsNotesDrawerOpen(!isNotesDrawerOpen)}
        onSave={savePdf}
        onToggleNavigation={() => setIsNavigationOpen(!isNavigationOpen)}
        onToggleSearch={() => setIsSearchOpen(!isSearchOpen)}
        onToggleFitPage={() => setFitPage((current) => !current)}
        onRotatePage={() => onPdfRotationChange((rotation + 90) % 360)}
        onPrint={() => window.print()}
        onAddBookmark={addBookmark}
        onUndo={undoAnnotations}
        onRedo={redoAnnotations}
      />

      <div className="relative flex flex-1 overflow-hidden">
        {isNavigationOpen && pdfDoc && (
          <PdfNavigationSidebar
            pdfDoc={pdfDoc}
            numPages={numPages}
            bookmarks={bookmarks}
            onSelectPage={scrollToPage}
            onRemoveBookmark={(id) => setBookmarks((current) => current.filter((b) => b.id !== id))}
            onClose={() => setIsNavigationOpen(false)}
          />
        )}
        <div
          ref={pagesContainerRef}
          onScroll={handleScroll}
          className="pdf-print-pages relative flex flex-1 flex-col items-center gap-8 overflow-x-auto overflow-y-auto p-8"
        >
          {isLoading && (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-white/70">
              <div className="border-3 h-8 w-8 animate-spin rounded-full border-fluent-accent border-t-transparent" />
              <span className="text-sm font-medium">Rendering PDF pages...</span>
            </div>
          )}

          {loadError && (
            <div className="my-8 flex flex-1 flex-col items-center justify-center gap-3 rounded-xl bg-black/20 p-8 py-20 text-center text-red-400">
              <AlertCircle className="h-10 w-10 text-red-400 opacity-80" />
              <span className="text-base font-semibold">Unable to display PDF</span>
              <p className="max-w-md rounded bg-black/30 p-3 font-mono text-xs opacity-75">
                {loadError}
              </p>
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
                  containerHeight={containerHeight}
                  fitPage={fitPage}
                  rotation={rotation}
                  searchQuery={searchQuery}
                  activeTool={activeTool}
                  highlightColor={highlightColor}
                  highlights={highlights.filter((h) => h.pageNumber === pageNum)}
                  comments={comments.filter((c) => c.pageNumber === pageNum)}
                  signatures={signatures.filter((signature) => signature.pageNumber === pageNum)}
                  ocrWords={ocrWordsByPage[pageNum] || []}
                  activeCommentId={activeCommentId}
                  currentDragBox={currentDragBox}
                  onPageClick={handlePageClick}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onDeleteHighlight={deleteHighlight}
                  onToggleComment={(id) => setActiveCommentId(activeCommentId === id ? null : id)}
                  onDeleteComment={deleteComment}
                  onDeleteSignature={(id) =>
                    onPdfSignaturesChange(signatures.filter((signature) => signature.id !== id))
                  }
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
      {isSearchOpen && (
        <PdfSearchPanel
          query={searchQuery}
          results={searchResults}
          resultIndex={searchResultIndex}
          isSearching={isSearching}
          onQueryChange={setSearchQuery}
          onSelectResult={selectSearchResult}
          onPrevious={() => selectSearchResult(searchResultIndex - 1)}
          onNext={() => selectSearchResult(searchResultIndex + 1)}
          onClose={() => {
            setIsSearchOpen(false);
            setSearchQuery('');
          }}
        />
      )}
    </div>
  );
};
