import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronUp, ChevronDown, X } from 'lucide-react';

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const findNext = (backwards = false) => {
    if (!query) return;
    // Chromium native window.find API
    (window as any).find(query, false, backwards, true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      findNext(e.shiftKey);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="animate-in fade-in slide-in-from-top-2 fixed right-6 top-12 z-40 flex select-none items-center gap-1.5 rounded-lg border border-fluent-border-light bg-fluent-card-light p-1.5 text-xs shadow-xl backdrop-blur-md duration-150 dark:border-fluent-border-dark dark:bg-fluent-card-dark">
      <Search className="ml-1.5 h-3.5 w-3.5 text-fluent-accent opacity-50" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          if (e.target.value) {
            (window as any).find(e.target.value, false, false, true);
          }
        }}
        onKeyDown={handleKeyDown}
        placeholder="Find in document..."
        className="w-44 rounded border border-transparent bg-black/5 px-2 py-1 text-fluent-text-primaryLight outline-none focus:border-fluent-accent dark:bg-white/5 dark:text-fluent-text-primaryDark"
      />

      <button
        onClick={() => findNext(true)}
        title="Previous match (Shift+Enter)"
        className="rounded p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
      >
        <ChevronUp className="h-3.5 w-3.5" />
      </button>

      <button
        onClick={() => findNext(false)}
        title="Next match (Enter)"
        className="rounded p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
      >
        <ChevronDown className="h-3.5 w-3.5" />
      </button>

      <div className="mx-0.5 h-4 w-[1px] bg-fluent-border-light dark:bg-fluent-border-dark" />

      <button
        onClick={onClose}
        title="Close (Esc)"
        className="rounded p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
