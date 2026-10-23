import { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerRaw from 'pdfjs-dist/build/pdf.worker.min.js?raw';
import { PDFDocument, rgb } from 'pdf-lib';
import { PdfHighlight, PdfComment } from '../../types';

// Configure in-memory PDF.js worker
if (typeof window !== 'undefined') {
  try {
    const workerBlob = new Blob([pdfWorkerRaw], { type: 'application/javascript' });
    pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(workerBlob);
  } catch (err) {
    console.error('Failed to initialize in-memory PDF.js worker:', err);
    pdfjsLib.GlobalWorkerOptions.workerSrc = './pdf.worker.min.js';
  }
}

interface UsePdfDocumentProps {
  base64Data: string;
  highlights: PdfHighlight[];
  comments: PdfComment[];
  onSavePdf: (newBase64: string) => Promise<void>;
}

export function usePdfDocument({ base64Data, highlights, comments, onSavePdf }: UsePdfDocumentProps) {
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setLoadError(null);

    const loadPdf = async () => {
      try {
        if (!base64Data) {
          throw new Error('No PDF content available');
        }

        const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
        const normalized = cleanBase64.replace(/\s/g, '');
        const binaryString = atob(normalized);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const loadingTask = pdfjsLib.getDocument({
          data: bytes,
          isEvalSupported: false,
        });

        const doc = await loadingTask.promise;
        if (!isCancelled) {
          setPdfDoc(doc);
          setNumPages(doc.numPages);
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error('Failed to load PDF in pdfjs:', err);
        if (!isCancelled) {
          setLoadError(err?.message || 'Failed to parse PDF document');
          setIsLoading(false);
        }
      }
    };

    loadPdf();
    return () => {
      isCancelled = true;
    };
  }, [base64Data]);

  // Save PDF annotations
  const handleSaveWithAnnotations = async () => {
    if (!base64Data || isSaving) return;
    setIsSaving(true);
    try {
      const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
      const binaryString = atob(cleanBase64.replace(/\s/g, ''));
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const loadedPdf = await PDFDocument.load(bytes);
      const pages = loadedPdf.getPages();

      const parseColor = (hex: string) => {
        if (hex.startsWith('#')) hex = hex.substring(1);
        const r = parseInt(hex.substring(0, 2), 16) / 255;
        const g = parseInt(hex.substring(2, 4), 16) / 255;
        const b = parseInt(hex.substring(4, 6), 16) / 255;
        return rgb(r || 1, g || 0.9, b || 0.4);
      };

      for (const h of highlights) {
        if (h.pageNumber <= pages.length) {
          const page = pages[h.pageNumber - 1];
          const { width, height } = page.getSize();
          page.drawRectangle({
            x: h.xPct * width,
            y: height - (h.yPct * height + h.heightPct * height),
            width: h.widthPct * width,
            height: h.heightPct * height,
            color: parseColor(h.color),
            opacity: 0.35,
          });
        }
      }

      for (const c of comments) {
        if (c.pageNumber <= pages.length) {
          const page = pages[c.pageNumber - 1];
          const { width, height } = page.getSize();
          page.drawCircle({
            x: c.xPct * width,
            y: height - c.yPct * height,
            size: 6,
            color: rgb(0.98, 0.65, 0.12),
            opacity: 0.95,
          });
        }
      }

      const updatedBase64 = await loadedPdf.saveAsBase64({ dataUri: false });
      await onSavePdf(updatedBase64);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to save PDF annotations:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    pdfDoc,
    numPages,
    isLoading,
    loadError,
    isSaving,
    saveSuccess,
    handleSaveWithAnnotations,
  };
}
