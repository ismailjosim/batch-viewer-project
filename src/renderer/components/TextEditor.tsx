import React, { useRef, useMemo } from 'react';

interface TextEditorProps {
  content: string;
  onChange: (value: string) => void;
  zoom: number;
}

export const TextEditor: React.FC<TextEditorProps> = ({ content, onChange, zoom }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lineCount = useMemo(() => {
    return content.split('\n').length;
  }, [content]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      if (e.shiftKey) {
        const before = content.substring(0, start);
        const after = content.substring(end);
        if (before.endsWith('  ')) {
          onChange(before.slice(0, -2) + after);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start - 2;
          }, 0);
        }
      } else {
        const next = content.substring(0, start) + '  ' + content.substring(end);
        onChange(next);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        }, 0);
      }
    }
  };

  return (
    <div
      style={{ fontSize: `${zoom * 100}%` }}
      className="flex h-full flex-1 overflow-hidden bg-fluent-card-light/40 font-mono dark:bg-fluent-card-dark/40"
    >
      {/* Line Numbers */}
      <div className="w-14 shrink-0 select-none overflow-hidden border-r border-fluent-border-light bg-black/5 py-6 pr-3 text-right text-xs opacity-35 dark:border-fluent-border-dark dark:bg-black/10">
        {Array.from({ length: lineCount }).map((_, i) => (
          <div key={i} className="leading-6">
            {i + 1}
          </div>
        ))}
      </div>

      {/* Plain text area */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type text content here..."
        spellCheck={false}
        className="h-full flex-1 select-text resize-none overflow-y-auto bg-transparent p-6 font-mono text-sm leading-6 text-fluent-text-primaryLight outline-none placeholder:opacity-40 dark:text-fluent-text-primaryDark"
      />
    </div>
  );
};
