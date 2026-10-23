import React, { useRef, useMemo, useEffect } from "react";
import { MarkdownToolbar } from "./MarkdownToolbar";

interface EditorProps {
  content: string;
  onChange: (newContent: string) => void;
  zoom: number;
  onScroll?: (pct: number) => void;
  externalScrollPct?: number | null;
}

export const Editor: React.FC<EditorProps> = ({
  content,
  onChange,
  zoom,
  onScroll,
  externalScrollPct,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const isInternalScrollRef = useRef(false);

  const lineCount = useMemo(() => {
    return content.split("\n").length;
  }, [content]);

  // Synchronize incoming external scroll from Split View Preview
  useEffect(() => {
    if (
      externalScrollPct !== undefined &&
      externalScrollPct !== null &&
      textareaRef.current
    ) {
      if (isInternalScrollRef.current) return;
      const el = textareaRef.current;
      const maxScroll = el.scrollHeight - el.clientHeight;
      if (maxScroll > 0) {
        el.scrollTop = externalScrollPct * maxScroll;
        if (lineNumbersRef.current) {
          lineNumbersRef.current.scrollTop = el.scrollTop;
        }
      }
    }
  }, [externalScrollPct]);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = el.scrollTop;
    }

    if (onScroll) {
      isInternalScrollRef.current = true;
      const maxScroll = el.scrollHeight - el.clientHeight;
      const pct = maxScroll > 0 ? el.scrollTop / maxScroll : 0;
      onScroll(pct);
      setTimeout(() => {
        isInternalScrollRef.current = false;
      }, 50);
    }
  };

  const handleInsert = (prefix: string, suffix = "", defaultText = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const textToInsert = selected || defaultText;
    const replacement = `${prefix}${textToInsert}${suffix}`;

    const newContent =
      content.substring(0, start) + replacement + content.substring(end);
    onChange(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + textToInsert.length,
      );
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Tab key indentation
    if (e.key === "Tab") {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      if (e.shiftKey) {
        // Outdent
        const before = content.substring(0, start);
        const after = content.substring(end);
        if (before.endsWith("  ")) {
          onChange(before.slice(0, -2) + after);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start - 2;
          }, 0);
        }
      } else {
        // Indent 2 spaces
        const updated =
          content.substring(0, start) + "  " + content.substring(end);
        onChange(updated);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        }, 0);
      }
    }

    // Bold (Ctrl+B)
    if (e.ctrlKey && e.key.toLowerCase() === "b") {
      e.preventDefault();
      handleInsert("**", "**", "bold text");
    }

    // Italic (Ctrl+I)
    if (e.ctrlKey && e.key.toLowerCase() === "i") {
      e.preventDefault();
      handleInsert("*", "*", "italic text");
    }

    // Link (Ctrl+K)
    if (e.ctrlKey && e.key.toLowerCase() === "k") {
      e.preventDefault();
      handleInsert("[", "](https://)", "link text");
    }
  };

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden">
      {/* Markdown Formatting Toolbar */}
      <MarkdownToolbar onInsert={handleInsert} />

      {/* Main Editing Area */}
      <div
        style={{ fontSize: `${zoom * 100}%` }}
        className="flex-1 h-full flex overflow-hidden bg-fluent-card-light/40 dark:bg-fluent-card-dark/40 font-mono"
      >
        {/* Line Numbers with synchronized scroll */}
        <div
          ref={lineNumbersRef}
          className="w-12 py-6 select-none text-right pr-3 text-xs opacity-30 border-r border-fluent-border-light dark:border-fluent-border-dark overflow-hidden shrink-0 bg-black/5 dark:bg-black/10"
        >
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i} className="leading-6">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Editor Textarea */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          placeholder="Type Markdown content here..."
          spellCheck={false}
          className="flex-1 h-full p-6 bg-transparent resize-none outline-none leading-6 text-sm text-fluent-text-primaryLight dark:text-fluent-text-primaryDark placeholder:opacity-40 overflow-y-auto select-text font-mono"
        />
      </div>
    </div>
  );
};
