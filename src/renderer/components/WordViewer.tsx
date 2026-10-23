import React, { useEffect, useState, useRef } from 'react';
import mammoth from 'mammoth';
import { FileDown, Edit3, Eye, Printer, ZoomIn, ZoomOut, Check } from 'lucide-react';

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
  const [htmlContent, setHtmlContent] = useState<string>(initialHtml || '');
  const [loading, setLoading] = useState<boolean>(!initialHtml && !!base64Data);
  const [error, setError] = useState<string | null>(null);
  const [isEditable, setIsEditable] = useState<boolean>(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // Convert docx buffer to HTML using Mammoth
  useEffect(() => {
    if (initialHtml) {
      setHtmlContent(initialHtml);
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

        const result = await mammoth.convertToHtml({ arrayBuffer: bytes.buffer });
        if (isMounted) {
          const generatedHtml = result.value;
          setHtmlContent(generatedHtml);
          onContentChange(generatedHtml);
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
  }, [base64Data, initialHtml]);

  const handleInput = () => {
    if (editorRef.current) {
      const updated = editorRef.current.innerHTML;
      setHtmlContent(updated);
      onContentChange(updated);
    }
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-[#eef1f5] dark:bg-[#1a1c23] overflow-hidden select-text">
      {/* Word Controls Toolbar */}
      <div className="h-10 px-4 flex items-center justify-between bg-fluent-card-light/90 dark:bg-fluent-card-dark/90 border-b border-fluent-border-light dark:border-fluent-border-dark select-none text-xs shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
            Word / Docs
          </span>
          <span className="opacity-75 font-medium truncate max-w-xs">{fileName}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditable(!isEditable)}
            title={isEditable ? 'Switch to Reader Mode' : 'Switch to Edit Mode'}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-all ${
              isEditable
                ? 'bg-fluent-accent text-white shadow-sm'
                : 'hover:bg-black/5 dark:hover:bg-white/10 text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark'
            }`}
          >
            {isEditable ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
            <span>{isEditable ? 'Reading View' : 'Edit Document'}</span>
          </button>

          <button
            onClick={onSaveAsPdf}
            title="Export as PDF"
            className="px-2.5 py-1 rounded bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors flex items-center gap-1.5"
          >
            <FileDown className="w-3.5 h-3.5 text-fluent-accent" />
            <span>Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Main Document Content Scroll View */}
      <div className="flex-1 overflow-y-auto p-8 flex justify-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center my-auto text-sm opacity-60 gap-3">
            <div className="w-7 h-7 border-3 border-fluent-accent border-t-transparent rounded-full animate-spin" />
            <span>Rendering Word document...</span>
          </div>
        ) : error ? (
          <div className="max-w-md p-6 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-sm my-auto text-center">
            {error}
          </div>
        ) : (
          /* A4 Paper Sheet View */
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
            }}
            className="transition-transform duration-150 mb-12"
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
              className={`p-16 bg-white dark:bg-[#20222a] text-[#1c1d1f] dark:text-[#f0f0f2] shadow-2xl rounded-sm border border-black/10 dark:border-white/10 outline-none font-serif leading-relaxed text-base transition-shadow ${
                isEditable ? 'ring-2 ring-fluent-accent/50 cursor-text' : ''
              } prose dark:prose-invert max-w-none prose-headings:font-sans prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:my-3 prose-table:border-collapse prose-td:border prose-td:p-2 prose-th:border prose-th:p-2 prose-th:bg-black/5 dark:prose-th:bg-white/5`}
              dangerouslySetInnerHTML={{ __html: htmlContent || '<p>Empty document</p>' }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
