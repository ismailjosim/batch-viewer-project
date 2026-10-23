import React, { useMemo } from 'react';
import { ListTree, ChevronRight } from 'lucide-react';

interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

interface OutlineSidebarProps {
  content: string;
  isOpen: boolean;
  onToggle: () => void;
  onSelectHeading: (id: string) => void;
}

export const OutlineSidebar: React.FC<OutlineSidebarProps> = ({
  content,
  isOpen,
  onToggle,
  onSelectHeading,
}) => {
  const headings = useMemo<HeadingItem[]>(() => {
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
  }, [content]);

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        title="Open Outline (Table of Contents)"
        className="fixed bottom-4 left-4 z-40 rounded-full border border-fluent-border-light bg-fluent-card-light p-2.5 shadow-lg transition-transform hover:scale-105 hover:bg-black/5 dark:border-fluent-border-dark dark:bg-fluent-card-dark dark:hover:bg-white/10"
      >
        <ListTree className="h-4 w-4 text-fluent-accent" />
      </button>
    );
  }

  return (
    <aside className="flex h-full w-64 shrink-0 select-none flex-col border-r border-fluent-border-light bg-fluent-card-light/50 backdrop-blur-md transition-all duration-200 dark:border-fluent-border-dark dark:bg-fluent-card-dark/50">
      <div className="flex items-center justify-between border-b border-fluent-border-light p-3 dark:border-fluent-border-dark">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide opacity-75">
          <ListTree className="h-3.5 w-3.5 text-fluent-accent" />
          <span>Outline</span>
        </div>
        <button
          onClick={onToggle}
          title="Collapse Outline"
          className="rounded p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
        >
          <ChevronRight className="h-3.5 w-3.5 rotate-180" />
        </button>
      </div>

      <div className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {headings.length === 0 ? (
          <div className="py-8 text-center text-xs italic opacity-50">
            No headings found in document
          </div>
        ) : (
          headings.map((heading, idx) => (
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
          ))
        )}
      </div>
    </aside>
  );
};
