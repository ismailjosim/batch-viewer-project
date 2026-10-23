import React, { useMemo } from "react";
import { ListTree, ChevronRight } from "lucide-react";

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
    const lines = content.split("\n");
    const items: HeadingItem[] = [];

    lines.forEach((line) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim().replace(/[*_`]/g, "");
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-");

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
        className="fixed bottom-4 left-4 p-2.5 rounded-full bg-fluent-card-light dark:bg-fluent-card-dark border border-fluent-border-light dark:border-fluent-border-dark shadow-lg hover:bg-black/5 dark:hover:bg-white/10 z-40 transition-transform hover:scale-105"
      >
        <ListTree className="w-4 h-4 text-fluent-accent" />
      </button>
    );
  }

  return (
    <aside className="w-64 h-full flex flex-col border-r border-fluent-border-light dark:border-fluent-border-dark bg-fluent-card-light/50 dark:bg-fluent-card-dark/50 backdrop-blur-md select-none shrink-0 transition-all duration-200">
      <div className="flex items-center justify-between p-3 border-b border-fluent-border-light dark:border-fluent-border-dark">
        <div className="flex items-center gap-2 font-semibold text-xs tracking-wide uppercase opacity-75">
          <ListTree className="w-3.5 h-3.5 text-fluent-accent" />
          <span>Outline</span>
        </div>
        <button
          onClick={onToggle}
          title="Collapse Outline"
          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <ChevronRight className="w-3.5 h-3.5 rotate-180" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {headings.length === 0 ? (
          <div className="text-center py-8 text-xs opacity-50 italic">
            No headings found in document
          </div>
        ) : (
          headings.map((heading, idx) => (
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
          ))
        )}
      </div>
    </aside>
  );
};
