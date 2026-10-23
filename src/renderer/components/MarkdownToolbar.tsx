import React from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  FileCode,
  Link,
  Image,
  Table,
  Minus,
  Sigma,
  GitFork,
} from 'lucide-react';

interface MarkdownToolbarProps {
  onInsert: (prefix: string, suffix?: string, defaultText?: string) => void;
}

export const MarkdownToolbar: React.FC<MarkdownToolbarProps> = ({ onInsert }) => {
  return (
    <div className="scrollbar-none flex h-9 shrink-0 select-none items-center gap-0.5 overflow-x-auto border-b border-fluent-border-light bg-fluent-card-light/90 px-3 text-xs dark:border-fluent-border-dark dark:bg-fluent-card-dark/90">
      {/* Headings */}
      <div className="mr-1 flex items-center gap-0.5 border-r border-fluent-border-light pr-1 dark:border-fluent-border-dark">
        <button
          onClick={() => onInsert('# ', '', 'Heading 1')}
          title="Heading 1"
          className="rounded p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
        >
          <Heading1 className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onInsert('## ', '', 'Heading 2')}
          title="Heading 2"
          className="rounded p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
        >
          <Heading2 className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onInsert('### ', '', 'Heading 3')}
          title="Heading 3"
          className="rounded p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
        >
          <Heading3 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Basic Text Formatting */}
      <div className="mr-1 flex items-center gap-0.5 border-r border-fluent-border-light pr-1 dark:border-fluent-border-dark">
        <button
          onClick={() => onInsert('**', '**', 'bold text')}
          title="Bold (Ctrl+B)"
          className="rounded p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
        >
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onInsert('*', '*', 'italic text')}
          title="Italic (Ctrl+I)"
          className="rounded p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
        >
          <Italic className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onInsert('~~', '~~', 'strikethrough text')}
          title="Strikethrough"
          className="rounded p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
        >
          <Strikethrough className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Lists & Checklist */}
      <div className="mr-1 flex items-center gap-0.5 border-r border-fluent-border-light pr-1 dark:border-fluent-border-dark">
        <button
          onClick={() => onInsert('- ', '', 'List item')}
          title="Bullet List"
          className="rounded p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
        >
          <List className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onInsert('1. ', '', 'Numbered item')}
          title="Numbered List"
          className="rounded p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onInsert('- [ ] ', '', 'Task item')}
          title="Task Checklist"
          className="rounded p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
        >
          <CheckSquare className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onInsert('> ', '', 'Quote text')}
          title="Blockquote"
          className="rounded p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
        >
          <Quote className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Code */}
      <div className="mr-1 flex items-center gap-0.5 border-r border-fluent-border-light pr-1 dark:border-fluent-border-dark">
        <button
          onClick={() => onInsert('`', '`', 'code')}
          title="Inline Code"
          className="rounded p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
        >
          <Code className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onInsert('```typescript\n', '\n```', '// Your code here')}
          title="Code Block"
          className="rounded p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
        >
          <FileCode className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Media & Links */}
      <div className="mr-1 flex items-center gap-0.5 border-r border-fluent-border-light pr-1 dark:border-fluent-border-dark">
        <button
          onClick={() => onInsert('[', '](https://example.com)', 'Link text')}
          title="Hyperlink"
          className="rounded p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
        >
          <Link className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() =>
            onInsert('![', '](https://via.placeholder.com/600x400)', 'Image alt description')
          }
          title="Image"
          className="rounded p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
        >
          <Image className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() =>
            onInsert(
              '| Header 1 | Header 2 | Header 3 |\n| :--- | :--- | :--- |\n| Item 1 | Item 2 | Item 3 |\n| Item 4 | Item 5 | Item 6 |\n'
            )
          }
          title="Insert Table"
          className="rounded p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
        >
          <Table className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onInsert('\n---\n')}
          title="Horizontal Divider"
          className="rounded p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Advanced (Math & Mermaid) */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={() => onInsert('$$\n', '\n$$', 'E = mc^2')}
          title="LaTeX Math Formula"
          className="flex items-center gap-1 rounded p-1 px-1.5 text-[11px] transition-colors hover:bg-black/5 dark:hover:bg-white/10"
        >
          <Sigma className="h-3.5 w-3.5 text-fluent-accent" />
          <span className="hidden xl:inline">Math</span>
        </button>
        <button
          onClick={() =>
            onInsert(
              '```mermaid\nflowchart LR\n    A[Step 1] --> B[Step 2]\n    B --> C[Result]\n```\n'
            )
          }
          title="Mermaid Diagram"
          className="flex items-center gap-1 rounded p-1 px-1.5 text-[11px] transition-colors hover:bg-black/5 dark:hover:bg-white/10"
        >
          <GitFork className="h-3.5 w-3.5 text-fluent-accent" />
          <span className="hidden xl:inline">Diagram</span>
        </button>
      </div>
    </div>
  );
};
