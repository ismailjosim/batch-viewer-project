import React from 'react';
import { ChevronDown, ChevronUp, Search, X } from 'lucide-react';

export interface PdfSearchResult {
  pageNumber: number;
  count: number;
  snippet: string;
}

interface PdfSearchPanelProps {
  query: string;
  results: PdfSearchResult[];
  resultIndex: number;
  isSearching: boolean;
  onQueryChange: (query: string) => void;
  onSelectResult: (resultIndex: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  onClose: () => void;
}

export const PdfSearchPanel: React.FC<PdfSearchPanelProps> = ({
  query,
  results,
  resultIndex,
  isSearching,
  onQueryChange,
  onSelectResult,
  onPrevious,
  onNext,
  onClose,
}) => (
  <div className="pdf-search-panel absolute right-4 top-3 z-40 w-80 max-w-[calc(100%-2rem)] overflow-hidden rounded-xl border border-fluent-border-light bg-fluent-card-light shadow-xl dark:border-fluent-border-dark dark:bg-fluent-card-dark">
    <div className="flex items-center gap-2 p-2">
      <Search className="h-4 w-4 shrink-0 text-fluent-accent" />
      <input
        autoFocus
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            if (event.shiftKey) onPrevious();
            else onNext();
          }
          if (event.key === 'Escape') onClose();
        }}
        placeholder="Find in PDF"
        aria-label="Find in PDF"
        className="min-w-0 flex-1 bg-transparent text-xs outline-none"
      />
      <span className="whitespace-nowrap text-[10px] opacity-60">
        {isSearching ? 'Searching…' : `${results.length ? resultIndex + 1 : 0}/${results.length}`}
      </span>
      <button type="button" onClick={onPrevious} title="Previous result" aria-label="Previous result">
        <ChevronUp className="h-4 w-4" />
      </button>
      <button type="button" onClick={onNext} title="Next result" aria-label="Next result">
        <ChevronDown className="h-4 w-4" />
      </button>
      <button type="button" onClick={onClose} title="Close search" aria-label="Close search">
        <X className="h-4 w-4" />
      </button>
    </div>
    {query.trim() && !isSearching && (
      <div className="max-h-52 overflow-y-auto border-t border-fluent-border-light dark:border-fluent-border-dark">
        {results.length === 0 ? (
          <p className="p-3 text-[11px] opacity-60">No matches found.</p>
        ) : (
          results.map((result, index) => (
            <button
              key={`${result.pageNumber}-${index}`}
              type="button"
              onClick={() => onSelectResult(index)}
              className={`block w-full border-b border-fluent-border-light px-3 py-2 text-left last:border-0 dark:border-fluent-border-dark ${
                index === resultIndex ? 'bg-fluent-accent/10' : 'hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <span className="mr-2 font-semibold text-fluent-accent">
                Page {result.pageNumber} · {result.count}
              </span>
              <span className="block truncate text-[11px] opacity-80">{result.snippet}</span>
            </button>
          ))
        )}
      </div>
    )}
  </div>
);
