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
    <div className="fixed top-12 right-6 z-40 flex items-center gap-1.5 p-1.5 bg-fluent-card-light dark:bg-fluent-card-dark border border-fluent-border-light dark:border-fluent-border-dark rounded-lg shadow-xl backdrop-blur-md text-xs select-none animate-in fade-in slide-in-from-top-2 duration-150">
      <Search className="w-3.5 h-3.5 opacity-50 ml-1.5 text-fluent-accent" />
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
        className="w-44 px-2 py-1 bg-black/5 dark:bg-white/5 rounded border border-transparent focus:border-fluent-accent outline-none text-fluent-text-primaryLight dark:text-fluent-text-primaryDark"
      />

      <button
        onClick={() => findNext(true)}
        title="Previous match (Shift+Enter)"
        className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
      >
        <ChevronUp className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={() => findNext(false)}
        title="Next match (Enter)"
        className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
      >
        <ChevronDown className="w-3.5 h-3.5" />
      </button>

      <div className="w-[1px] h-4 bg-fluent-border-light dark:bg-fluent-border-dark mx-0.5" />

      <button
        onClick={onClose}
        title="Close (Esc)"
        className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
