import React, { useRef, useMemo } from "react";

interface TextEditorProps {
  content: string;
  onChange: (value: string) => void;
  zoom: number;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  content,
  onChange,
  zoom,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lineCount = useMemo(() => {
    return content.split("\n").length;
  }, [content]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    if (e.key === "Tab") {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      if (e.shiftKey) {
        const before = content.substring(0, start);
        const after = content.substring(end);
        if (before.endsWith("  ")) {
          onChange(before.slice(0, -2) + after);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start - 2;
          }, 0);
        }
      } else {
        const next =
          content.substring(0, start) + "  " + content.substring(end);
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
      className="flex-1 h-full flex overflow-hidden bg-fluent-card-light/40 dark:bg-fluent-card-dark/40 font-mono"
    >
      {/* Line Numbers */}
      <div className="w-14 py-6 select-none text-right pr-3 text-xs opacity-35 border-r border-fluent-border-light dark:border-fluent-border-dark overflow-hidden shrink-0 bg-black/5 dark:bg-black/10">
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
        className="flex-1 h-full p-6 bg-transparent resize-none outline-none leading-6 text-sm text-fluent-text-primaryLight dark:text-fluent-text-primaryDark placeholder:opacity-40 overflow-y-auto select-text font-mono"
      />
    </div>
  );
};
