import React from "react";
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
} from "lucide-react";

interface MarkdownToolbarProps {
  onInsert: (prefix: string, suffix?: string, defaultText?: string) => void;
}

export const MarkdownToolbar: React.FC<MarkdownToolbarProps> = ({
  onInsert,
}) => {
  return (
    <div className="h-9 px-3 flex items-center gap-0.5 bg-fluent-card-light/90 dark:bg-fluent-card-dark/90 border-b border-fluent-border-light dark:border-fluent-border-dark select-none text-xs overflow-x-auto shrink-0 scrollbar-none">
      {/* Headings */}
      <div className="flex items-center gap-0.5 mr-1 pr-1 border-r border-fluent-border-light dark:border-fluent-border-dark">
        <button
          onClick={() => onInsert("# ", "", "Heading 1")}
          title="Heading 1"
          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <Heading1 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onInsert("## ", "", "Heading 2")}
          title="Heading 2"
          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <Heading2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onInsert("### ", "", "Heading 3")}
          title="Heading 3"
          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <Heading3 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Basic Text Formatting */}
      <div className="flex items-center gap-0.5 mr-1 pr-1 border-r border-fluent-border-light dark:border-fluent-border-dark">
        <button
          onClick={() => onInsert("**", "**", "bold text")}
          title="Bold (Ctrl+B)"
          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onInsert("*", "*", "italic text")}
          title="Italic (Ctrl+I)"
          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onInsert("~~", "~~", "strikethrough text")}
          title="Strikethrough"
          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Lists & Checklist */}
      <div className="flex items-center gap-0.5 mr-1 pr-1 border-r border-fluent-border-light dark:border-fluent-border-dark">
        <button
          onClick={() => onInsert("- ", "", "List item")}
          title="Bullet List"
          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <List className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onInsert("1. ", "", "Numbered item")}
          title="Numbered List"
          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onInsert("- [ ] ", "", "Task item")}
          title="Task Checklist"
          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <CheckSquare className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onInsert("> ", "", "Quote text")}
          title="Blockquote"
          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <Quote className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Code */}
      <div className="flex items-center gap-0.5 mr-1 pr-1 border-r border-fluent-border-light dark:border-fluent-border-dark">
        <button
          onClick={() => onInsert("`", "`", "code")}
          title="Inline Code"
          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <Code className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() =>
            onInsert("```typescript\n", "\n```", "// Your code here")
          }
          title="Code Block"
          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <FileCode className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Media & Links */}
      <div className="flex items-center gap-0.5 mr-1 pr-1 border-r border-fluent-border-light dark:border-fluent-border-dark">
        <button
          onClick={() => onInsert("[", "](https://example.com)", "Link text")}
          title="Hyperlink"
          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <Link className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() =>
            onInsert(
              "![",
              "](https://via.placeholder.com/600x400)",
              "Image alt description",
            )
          }
          title="Image"
          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <Image className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() =>
            onInsert(
              "| Header 1 | Header 2 | Header 3 |\n| :--- | :--- | :--- |\n| Item 1 | Item 2 | Item 3 |\n| Item 4 | Item 5 | Item 6 |\n",
            )
          }
          title="Insert Table"
          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <Table className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onInsert("\n---\n")}
          title="Horizontal Divider"
          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Advanced (Math & Mermaid) */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={() => onInsert("$$\n", "\n$$", "E = mc^2")}
          title="LaTeX Math Formula"
          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center gap-1 px-1.5 text-[11px]"
        >
          <Sigma className="w-3.5 h-3.5 text-fluent-accent" />
          <span className="hidden xl:inline">Math</span>
        </button>
        <button
          onClick={() =>
            onInsert(
              "```mermaid\nflowchart LR\n    A[Step 1] --> B[Step 2]\n    B --> C[Result]\n```\n",
            )
          }
          title="Mermaid Diagram"
          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center gap-1 px-1.5 text-[11px]"
        >
          <GitFork className="w-3.5 h-3.5 text-fluent-accent" />
          <span className="hidden xl:inline">Diagram</span>
        </button>
      </div>
    </div>
  );
};
