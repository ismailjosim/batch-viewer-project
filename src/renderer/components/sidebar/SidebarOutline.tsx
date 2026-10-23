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
      <div className="text-center py-8 text-xs text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark opacity-60 italic px-4">
        Outline navigation is available when viewing Markdown files
      </div>
    );
  }

  if (headings.length === 0) {
    return (
      <div className="text-center py-8 text-xs text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark opacity-60 italic">
        No headings found in document
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-0.5 select-none">
      {headings.map((heading, idx) => (
        <button
          key={`${heading.id}-${idx}`}
          onClick={() => onSelectHeading(heading.id)}
          style={{ paddingLeft: `${(heading.level - 1) * 12 + 8}px` }}
          className="w-full text-left py-1 px-2 rounded text-xs hover:bg-fluent-accent/10 hover:text-fluent-accent truncate transition-colors text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark"
          title={heading.text}
        >
          <span className="opacity-40 mr-1.5 font-mono text-[10px]">
            H{heading.level}
          </span>
          {heading.text}
        </button>
      ))}
    </div>
  );
};
