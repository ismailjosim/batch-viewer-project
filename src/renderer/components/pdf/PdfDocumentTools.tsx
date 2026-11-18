import React, { useState } from 'react';
import { FilePlus2, FileSymlink, Files, PenLine, Scissors, Wrench } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

type PdfFormFieldKind = 'text' | 'checkbox' | 'dropdown' | 'radio' | 'unsupported';

interface PdfDocumentToolsProps {
  base64Data: string;
  filePath: string | null;
  numPages: number;
  onDocumentChange: (base64: string, pageOrder?: number[]) => void;
  onBeginSignature: (value: string) => void;
  onRunOcr: (language: string) => Promise<void>;
  onNotify: (message: string) => void;
}

interface FormEntry {
  name: string;
  kind: PdfFormFieldKind;
  value: string;
  options: string[];
}

const decodeBase64 = (value: string) => {
  const clean = value.includes(',') ? value.split(',')[1] : value;
  const binary = atob(clean.replace(/\s/g, ''));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
};

const encodeBase64 = async (pdf: PDFDocument) =>
  pdf.saveAsBase64({ dataUri: false });

const dialogClass =
  'fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm';
const panelClass =
  'max-h-[85vh] w-full max-w-xl overflow-hidden rounded-xl border border-fluent-border-light bg-fluent-card-light p-4 text-fluent-text-primaryLight shadow-2xl dark:border-fluent-border-dark dark:bg-fluent-card-dark dark:text-fluent-text-primaryDark';

export const PdfDocumentTools: React.FC<PdfDocumentToolsProps> = ({
  base64Data,
  filePath,
  numPages,
  onDocumentChange,
  onBeginSignature,
  onRunOcr,
  onNotify,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dialog, setDialog] = useState<'organize' | 'split' | 'form' | 'signature' | null>(null);
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [pageRange, setPageRange] = useState('1');
  const [formEntries, setFormEntries] = useState<FormEntry[]>([]);
  const [signature, setSignature] = useState('');
  const [ocrLanguage, setOcrLanguage] = useState('eng');
  const [isOcrRunning, setIsOcrRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isWorking, setIsWorking] = useState(false);

  const runOperation = async (operation: () => Promise<void>) => {
    setError(null);
    setIsWorking(true);
    try {
      await operation();
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : String(reason);
      console.error('PDF document operation failed:', reason);
      setError(message);
      onNotify(`PDF operation failed: ${message}`);
    } finally {
      setIsWorking(false);
    }
  };

  const openOrganizer = () => {
    setPageOrder(Array.from({ length: numPages }, (_, index) => index + 1));
    setDialog('organize');
    setIsOpen(false);
  };

  const applyPageOrder = () =>
    runOperation(async () => {
      if (pageOrder.length === 0) throw new Error('A PDF must contain at least one page.');
      const source = await PDFDocument.load(decodeBase64(base64Data));
      const result = await PDFDocument.create();
      const copiedPages = await result.copyPages(
        source,
        pageOrder.map((pageNumber) => pageNumber - 1)
      );
      copiedPages.forEach((page) => result.addPage(page));
      onDocumentChange(await encodeBase64(result), pageOrder);
      setDialog(null);
      onNotify('PDF pages updated. Save the document to keep the changes.');
    });

  const mergePdfs = () =>
    runOperation(async () => {
      if (!window.api) throw new Error('File access is unavailable in this environment.');
      const filePaths = await window.api.openFileDialog();
      const selectedPdfs = (filePaths || []).filter(
        (path) => path.toLowerCase().endsWith('.pdf') && path.toLowerCase() !== filePath?.toLowerCase()
      );
      if (selectedPdfs.length === 0) return;

      const target = await PDFDocument.load(decodeBase64(base64Data));
      const pageOrder = Array.from({ length: numPages }, (_, index) => index + 1);
      for (const path of selectedPdfs) {
        const file = await window.api.readBinaryFile(path);
        if (!file.success || !file.base64) {
          throw new Error(file.error || `Unable to read ${path}`);
        }
        const source = await PDFDocument.load(decodeBase64(file.base64));
        const imported = await target.copyPages(source, source.getPageIndices());
        imported.forEach((page) => target.addPage(page));
      }
      onDocumentChange(await encodeBase64(target), pageOrder);
      setIsOpen(false);
      onNotify('PDFs merged. Save the document to keep the changes.');
    });

  const splitPdf = () =>
    runOperation(async () => {
      if (!window.api) throw new Error('File access is unavailable in this environment.');
      const source = await PDFDocument.load(decodeBase64(base64Data));
      const selectedPages = new Set<number>();
      for (const part of pageRange.split(',')) {
        const [startText, endText] = part.trim().split('-');
        const start = Number(startText);
        const end = endText === undefined ? start : Number(endText);
        if (
          !Number.isInteger(start) ||
          !Number.isInteger(end) ||
          start < 1 ||
          end < start ||
          end > source.getPageCount()
        ) {
          throw new Error(`Invalid page range: ${part.trim()}`);
        }
        for (let pageNumber = start; pageNumber <= end; pageNumber += 1) {
          selectedPages.add(pageNumber);
        }
      }
      if (selectedPages.size === 0) throw new Error('Select at least one page to extract.');

      const result = await PDFDocument.create();
      const copiedPages = await result.copyPages(
        source,
        [...selectedPages].map((pageNumber) => pageNumber - 1)
      );
      copiedPages.forEach((page) => result.addPage(page));
      const targetPath = await window.api.saveFileDialog('extracted-pages.pdf');
      if (!targetPath) return;
      const saved = await window.api.saveBinaryFile(targetPath, await encodeBase64(result));
      if (!saved.success) throw new Error(saved.error || 'Unable to save extracted pages.');
      setDialog(null);
      setIsOpen(false);
      onNotify('Selected pages exported to a new PDF.');
    });

  const openForm = () =>
    runOperation(async () => {
      const source = await PDFDocument.load(decodeBase64(base64Data));
      const form = source.getForm();
      if (form.hasXFA()) {
        throw new Error('This PDF uses XFA forms, which cannot be edited by the current PDF engine.');
      }
      const entries = form.getFields().map((field): FormEntry => {
        const name = field.getName();
        const type = field.constructor.name;
        if (type === 'PDFTextField') {
          return { name, kind: 'text', value: form.getTextField(name).getText() || '', options: [] };
        }
        if (type === 'PDFCheckBox') {
          return {
            name,
            kind: 'checkbox',
            value: String(form.getCheckBox(name).isChecked()),
            options: [],
          };
        }
        if (type === 'PDFDropdown') {
          return {
            name,
            kind: 'dropdown',
            value: form.getDropdown(name).getSelected()[0] || '',
            options: form.getDropdown(name).getOptions(),
          };
        }
        if (type === 'PDFRadioGroup') {
          return {
            name,
            kind: 'radio',
            value: form.getRadioGroup(name).getSelected() || '',
            options: form.getRadioGroup(name).getOptions(),
          };
        }
        return { name, kind: 'unsupported', value: '', options: [] };
      });
      setFormEntries(entries);
      setDialog('form');
      setIsOpen(false);
    });

  const saveForm = () =>
    runOperation(async () => {
      const source = await PDFDocument.load(decodeBase64(base64Data));
      const form = source.getForm();
      formEntries.forEach((entry) => {
        if (entry.kind === 'text') form.getTextField(entry.name).setText(entry.value);
        if (entry.kind === 'checkbox') {
          if (entry.value === 'true') form.getCheckBox(entry.name).check();
          else form.getCheckBox(entry.name).uncheck();
        }
        if (entry.kind === 'dropdown' && entry.value) {
          form.getDropdown(entry.name).select(entry.value);
        }
        if (entry.kind === 'radio' && entry.value) {
          form.getRadioGroup(entry.name).select(entry.value);
        }
      });
      onDocumentChange(await encodeBase64(source));
      setDialog(null);
      onNotify('Form filled. Save the document to keep the changes.');
    });

  const beginSignature = () => {
    const value = signature.trim();
    if (!value) {
      setError('Enter a name or signature first.');
      return;
    }
    onBeginSignature(value);
    setDialog(null);
    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        title="PDF tools"
        className="rounded p-1.5 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
      >
        <Wrench className="h-3.5 w-3.5" />
      </button>
      {isOpen && (
        <div className="absolute right-4 top-12 z-40 w-52 rounded-lg border border-fluent-border-light bg-fluent-card-light p-1.5 text-xs shadow-xl dark:border-fluent-border-dark dark:bg-fluent-card-dark">
          <button type="button" onClick={openOrganizer} className="flex w-full items-center gap-2 rounded px-2 py-2 text-left hover:bg-black/5 dark:hover:bg-white/10">
            <Files className="h-3.5 w-3.5" /> Reorder / delete pages
          </button>
          <button type="button" onClick={mergePdfs} className="flex w-full items-center gap-2 rounded px-2 py-2 text-left hover:bg-black/5 dark:hover:bg-white/10">
            <FilePlus2 className="h-3.5 w-3.5" /> Merge PDFs
          </button>
          <button type="button"           onClick={() => { setDialog('split'); setIsOpen(false); }} className="flex w-full items-center gap-2 rounded px-2 py-2 text-left hover:bg-black/5 dark:hover:bg-white/10">
            <Scissors className="h-3.5 w-3.5" /> Extract pages
          </button>
          <button type="button" onClick={openForm} className="flex w-full items-center gap-2 rounded px-2 py-2 text-left hover:bg-black/5 dark:hover:bg-white/10">
            <FileSymlink className="h-3.5 w-3.5" /> Fill PDF form
          </button>
          <button type="button" onClick={() => { setDialog('signature'); setIsOpen(false); }} className="flex w-full items-center gap-2 rounded px-2 py-2 text-left hover:bg-black/5 dark:hover:bg-white/10">
            <PenLine className="h-3.5 w-3.5" /> Add typed signature
          </button>
          <div className="mt-1 border-t border-fluent-border-light pt-1 dark:border-fluent-border-dark">
            <label className="block px-2 py-1 text-[10px] opacity-70" htmlFor="pdf-ocr-language">OCR language</label>
            <select id="pdf-ocr-language" value={ocrLanguage} onChange={(event) => setOcrLanguage(event.target.value)} className="mx-2 mb-1 w-[calc(100%-1rem)] rounded border border-fluent-border-light bg-fluent-card-light px-2 py-1 dark:border-fluent-border-dark dark:bg-fluent-card-dark">
              <option value="eng">English</option>
              <option value="ben">Bangla</option>
              <option value="eng+ben">English + Bangla</option>
            </select>
            <button type="button" disabled={isOcrRunning} onClick={() => {
              setIsOcrRunning(true);
              onRunOcr(ocrLanguage).finally(() => setIsOcrRunning(false));
            }} className="w-full rounded px-2 py-2 text-left hover:bg-black/5 disabled:opacity-50 dark:hover:bg-white/10">
              {isOcrRunning ? 'Recognizing text…' : 'OCR scanned pages'}
            </button>
          </div>
        </div>
      )}

      {dialog && (
        <div className={dialogClass} role="presentation">
          <section
            role="dialog"
            aria-modal="true"
            aria-label="PDF document tools"
            className={panelClass}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">
                {dialog === 'organize' && 'Reorder or delete pages'}
                {dialog === 'split' && 'Extract pages'}
                {dialog === 'form' && 'Fill PDF form'}
                {dialog === 'signature' && 'Add typed signature'}
              </h2>
              <button type="button" onClick={() => { setDialog(null); setError(null); }} aria-label="Close dialog">
                ×
              </button>
            </div>

            {dialog === 'organize' && (
              <>
                <p className="mb-3 text-[11px] opacity-70">Changes stay in this tab until you save the PDF.</p>
                <div className="max-h-[55vh] space-y-1 overflow-y-auto">
                  {pageOrder.map((pageNumber, index) => (
                    <div key={`${pageNumber}-${index}`} className="flex items-center justify-between rounded border border-fluent-border-light p-2 dark:border-fluent-border-dark">
                      <span>Page {pageNumber}</span>
                      <div className="flex gap-1">
                        <button type="button" disabled={index === 0} onClick={() => setPageOrder((order) => {
                          const next = [...order];
                          [next[index - 1], next[index]] = [next[index], next[index - 1]];
                          return next;
                        })} aria-label={`Move page ${pageNumber} up`} className="rounded px-2 hover:bg-black/5 disabled:opacity-40 dark:hover:bg-white/10">↑</button>
                        <button type="button" disabled={index === pageOrder.length - 1} onClick={() => setPageOrder((order) => {
                          const next = [...order];
                          [next[index], next[index + 1]] = [next[index + 1], next[index]];
                          return next;
                        })} aria-label={`Move page ${pageNumber} down`} className="rounded px-2 hover:bg-black/5 disabled:opacity-40 dark:hover:bg-white/10">↓</button>
                        <button type="button" onClick={() => setPageOrder((order) => order.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Delete page ${pageNumber}`} className="rounded px-2 text-red-500 hover:bg-black/5 dark:hover:bg-white/10">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <button type="button" onClick={() => setDialog(null)} className="rounded px-3 py-1.5 text-xs hover:bg-black/5 dark:hover:bg-white/10">Cancel</button>
                  <button type="button" disabled={isWorking || pageOrder.length === 0} onClick={applyPageOrder} className="rounded bg-fluent-accent px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50">{isWorking ? 'Applying…' : 'Apply order'}</button>
                </div>
              </>
            )}

            {dialog === 'split' && (
              <div className="space-y-3">
                <label className="block text-xs">
                  Page numbers or ranges (for example: 1-3, 5)
                  <input value={pageRange} onChange={(event) => setPageRange(event.target.value)} className="mt-1 w-full rounded border border-fluent-border-light bg-transparent px-2 py-1.5 dark:border-fluent-border-dark" />
                </label>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setDialog(null)} className="rounded px-3 py-1.5 text-xs hover:bg-black/5 dark:hover:bg-white/10">Cancel</button>
                  <button type="button" disabled={isWorking} onClick={splitPdf} className="rounded bg-fluent-accent px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50">{isWorking ? 'Exporting…' : 'Export selection'}</button>
                </div>
              </div>
            )}

            {dialog === 'form' && (
              <>
                {formEntries.length === 0 ? (
                  <p className="py-4 text-xs opacity-70">No supported AcroForm fields were found in this PDF.</p>
                ) : (
                  <div className="max-h-[55vh] space-y-3 overflow-y-auto">
                    {formEntries.map((entry) => (
                      <label key={entry.name} className="block text-xs">
                        <span className="mb-1 block font-medium">{entry.name}</span>
                        {entry.kind === 'text' && (
                          <input value={entry.value} onChange={(event) => setFormEntries((entries) => entries.map((item) => item.name === entry.name ? { ...item, value: event.target.value } : item))} className="w-full rounded border border-fluent-border-light bg-transparent px-2 py-1.5 dark:border-fluent-border-dark" />
                        )}
                        {entry.kind === 'checkbox' && (
                          <input type="checkbox" checked={entry.value === 'true'} onChange={(event) => setFormEntries((entries) => entries.map((item) => item.name === entry.name ? { ...item, value: String(event.target.checked) } : item))} />
                        )}
                        {(entry.kind === 'dropdown' || entry.kind === 'radio') && (
                          <select value={entry.value} onChange={(event) => setFormEntries((entries) => entries.map((item) => item.name === entry.name ? { ...item, value: event.target.value } : item))} className="w-full rounded border border-fluent-border-light bg-fluent-card-light px-2 py-1.5 dark:border-fluent-border-dark dark:bg-fluent-card-dark">
                            <option value="">Select…</option>
                            {entry.options.map((option) => <option key={option} value={option}>{option}</option>)}
                          </select>
                        )}
                        {entry.kind === 'unsupported' && <span className="opacity-60">Unsupported field type</span>}
                      </label>
                    ))}
                  </div>
                )}
                <div className="mt-4 flex justify-end gap-2">
                  <button type="button" onClick={() => setDialog(null)} className="rounded px-3 py-1.5 text-xs hover:bg-black/5 dark:hover:bg-white/10">Cancel</button>
                  <button type="button" disabled={isWorking || formEntries.length === 0} onClick={saveForm} className="rounded bg-fluent-accent px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50">{isWorking ? 'Applying…' : 'Apply fields'}</button>
                </div>
              </>
            )}

            {dialog === 'signature' && (
              <div className="space-y-3">
                <p className="text-[11px] opacity-70">This places a visual signature only; it is not a certificate-backed digital signature.</p>
                <input autoFocus value={signature} onChange={(event) => setSignature(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && beginSignature()} placeholder="Type your name" className="w-full rounded border border-fluent-border-light bg-transparent px-2 py-1.5 text-sm italic dark:border-fluent-border-dark" />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setDialog(null)} className="rounded px-3 py-1.5 text-xs hover:bg-black/5 dark:hover:bg-white/10">Cancel</button>
                  <button type="button" onClick={beginSignature} className="rounded bg-fluent-accent px-3 py-1.5 text-xs font-medium text-white">Choose placement</button>
                </div>
              </div>
            )}

            {error && <p role="alert" className="mt-3 rounded bg-red-500/10 p-2 text-xs text-red-500">{error}</p>}
          </section>
        </div>
      )}
    </>
  );
};
