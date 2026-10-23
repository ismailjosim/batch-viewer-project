import React, { useEffect, useState, useRef } from 'react';
import mammoth from 'mammoth';
import DOMPurify from 'dompurify';
import { FileDown, Edit3, Eye } from 'lucide-react';

interface WordViewerProps {
  base64Data?: string;
  initialHtml?: string;
  fileName: string;
  zoom: number;
  onContentChange: (newHtml: string) => void;
  onSaveAsPdf: () => void;
}

export const WordViewer: React.FC<WordViewerProps> = ({
  base64Data,
  initialHtml,
  fileName,
  zoom,
  onContentChange,
  onSaveAsPdf,
}) => {
  const [htmlContent, setHtmlContent] = useState<string>(() =>
    initialHtml ? DOMPurify.sanitize(initialHtml) : ''
  );
  const [loading, setLoading] = useState<boolean>(!initialHtml && !!base64Data);
  const [error, setError] = useState<string | null>(null);
  const [isEditable, setIsEditable] = useState<boolean>(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // Convert docx buffer to HTML using Mammoth with DOMPurify sanitization
  useEffect(() => {
    if (initialHtml) {
      setHtmlContent(DOMPurify.sanitize(initialHtml));
      return;
    }

    if (!base64Data) return;

    let isMounted = true;
    const convertDocx = async () => {
      setLoading(true);
      setError(null);
      try {
        const binaryString = atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const result = await mammoth.convertToHtml({
          arrayBuffer: bytes.buffer,
        });
        if (isMounted) {
          const sanitizedHtml = DOMPurify.sanitize(result.value, {
            ADD_TAGS: ['table', 'thead', 'tbody', 'tr', 'td', 'th'],
            ADD_ATTR: ['style', 'class', 'colspan', 'rowspan'],
          });
          setHtmlContent(sanitizedHtml);
          onContentChange(sanitizedHtml);
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(`Failed to read Word document: ${err.message || err}`);
          setLoading(false);
        }
      }
    };

    convertDocx();
    return () => {
      isMounted = false;
    };
  }, [base64Data, initialHtml, onContentChange]);

  const handleInput = () => {
    if (editorRef.current) {
      const updated = DOMPurify.sanitize(editorRef.current.innerHTML);
      setHtmlContent(updated);
      onContentChange(updated);
    }
  };

  return (
    <div className="flex h-full flex-1 select-text flex-col overflow-hidden bg-[#eef1f5] dark:bg-[#1a1c23]">
      {/* Word Controls Toolbar */}
      <div className="z-10 flex h-10 shrink-0 select-none items-center justify-between border-b border-fluent-border-light bg-fluent-card-light/90 px-4 text-xs shadow-sm dark:border-fluent-border-dark dark:bg-fluent-card-dark/90">
        <div className="flex items-center gap-2">
          <span className="rounded bg-blue-500/10 px-2 py-0.5 font-semibold text-blue-600 dark:text-blue-400">
            Word / Docs
          </span>
          <span className="max-w-xs truncate font-medium opacity-75">{fileName}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditable(!isEditable)}
            title={isEditable ? 'Switch to Reader Mode' : 'Switch to Edit Mode'}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 transition-all ${
              isEditable
                ? 'bg-fluent-accent text-white shadow-sm'
                : 'text-fluent-text-secondaryLight hover:bg-black/5 dark:text-fluent-text-secondaryDark dark:hover:bg-white/10'
            }`}
          >
            {isEditable ? <Eye className="h-3.5 w-3.5" /> : <Edit3 className="h-3.5 w-3.5" />}
            <span>{isEditable ? 'Reading View' : 'Edit Document'}</span>
          </button>

          <button
            onClick={onSaveAsPdf}
            title="Export as PDF"
            className="flex items-center gap-1.5 rounded bg-black/5 px-2.5 py-1 transition-colors hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20"
          >
            <FileDown className="h-3.5 w-3.5 text-fluent-accent" />
            <span>Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Main Document Content Scroll View */}
      <div className="flex flex-1 justify-center overflow-y-auto p-8">
        {loading ? (
          <div className="my-auto flex flex-col items-center justify-center gap-3 text-sm opacity-60">
            <div className="border-3 h-7 w-7 animate-spin rounded-full border-fluent-accent border-t-transparent" />
            <span>Rendering Word document...</span>
          </div>
        ) : error ? (
          <div className="my-auto max-w-md rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center text-sm text-red-500">
            {error}
          </div>
        ) : (
          /* A4 Paper Sheet View */
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
            }}
            className="mb-12 transition-transform duration-150"
          >
            <div
              ref={editorRef}
              contentEditable={isEditable}
              onInput={handleInput}
              suppressContentEditableWarning={true}
              style={{
                width: '800px',
                minHeight: '1100px',
              }}
              className={`rounded-sm border border-black/10 bg-white p-16 font-serif text-base leading-relaxed text-[#1c1d1f] shadow-2xl outline-none transition-shadow dark:border-white/10 dark:bg-[#20222a] dark:text-[#f0f0f2] ${
                isEditable ? 'cursor-text ring-2 ring-fluent-accent/50' : ''
              } prose dark:prose-invert prose-headings:font-sans prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:my-3 prose-table:border-collapse prose-td:border prose-td:p-2 prose-th:border prose-th:p-2 prose-th:bg-black/5 dark:prose-th:bg-white/5 max-w-none`}
              dangerouslySetInnerHTML={{
                __html: htmlContent || '<p>Empty document</p>',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
