import React, { useMemo } from 'react';

interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

interface SidebarOutlineProps {
  content: string;
  isMarkdown: boolean;
  onSelectHeading: (id: string) => void;
}

export const SidebarOutline: React.FC<SidebarOutlineProps> = ({
  content,
  isMarkdown,
  onSelectHeading,
}) => {
  const headings = useMemo<HeadingItem[]>(() => {
    if (!isMarkdown || !content) return [];
    const lines = content.split('\n');
    const items: HeadingItem[] = [];

    lines.forEach((line) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim().replace(/[*_`]/g, '');
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');

        items.push({ id, text, level });
      }
    });

    return items;
  }, [content, isMarkdown]);

  if (!isMarkdown) {
    return (
      <div className="px-4 py-8 text-center text-xs italic text-fluent-text-secondaryLight opacity-60 dark:text-fluent-text-secondaryDark">
        Outline navigation is available when viewing Markdown files
      </div>
    );
  }

  if (headings.length === 0) {
    return (
      <div className="py-8 text-center text-xs italic text-fluent-text-secondaryLight opacity-60 dark:text-fluent-text-secondaryDark">
        No headings found in document
      </div>
    );
  }

  return (
    <div className="flex-1 select-none space-y-0.5 overflow-y-auto p-2">
      {headings.map((heading, idx) => (
        <button
          key={`${heading.id}-${idx}`}
          onClick={() => onSelectHeading(heading.id)}
          style={{ paddingLeft: `${(heading.level - 1) * 12 + 8}px` }}
          className="w-full truncate rounded px-2 py-1 text-left text-xs text-fluent-text-secondaryLight transition-colors hover:bg-fluent-accent/10 hover:text-fluent-accent dark:text-fluent-text-secondaryDark"
          title={heading.text}
        >
          <span className="mr-1.5 font-mono text-[10px] opacity-40">H{heading.level}</span>
          {heading.text}
        </button>
      ))}
    </div>
  );
};
