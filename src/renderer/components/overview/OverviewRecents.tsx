import React from 'react';
import { Clock, Trash2, X, FileText, FileCode, Layers } from 'lucide-react';
import { RecentDocument, DocumentType } from '../../types';

interface OverviewRecentsProps {
  recentFiles: RecentDocument[];
  onSelectRecent: (filePath: string) => void;
  onRemoveRecent: (filePath: string, e: React.MouseEvent) => void;
  onClearRecent: () => void;
}

export const OverviewRecents: React.FC<OverviewRecentsProps> = ({
  recentFiles,
  onSelectRecent,
  onRemoveRecent,
  onClearRecent,
}) => {
  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
    });
  };

  const getFormatBadge = (type: DocumentType) => {
    switch (type) {
      case 'pdf':
        return (
          <span className="rounded border border-red-500/25 bg-red-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-500">
            PDF
          </span>
        );
      case 'word':
        return (
          <span className="rounded border border-blue-500/25 bg-blue-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-500">
            DOCX
          </span>
        );
      case 'text':
        return (
          <span className="rounded border border-emerald-500/25 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
            TXT
          </span>
        );
      case 'markdown':
      default:
        return (
          <span className="rounded border border-purple-500/25 bg-purple-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-400">
            MD
          </span>
        );
    }
  };

  const getFormatIcon = (type: DocumentType) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'word':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'text':
        return <FileCode className="h-5 w-5 text-emerald-400" />;
      case 'markdown':
      default:
        return <FileText className="h-5 w-5 text-purple-400" />;
    }
  };

  if (recentFiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center space-y-2 rounded-2xl border border-dashed border-fluent-border-light bg-fluent-card-light/40 p-8 text-center dark:border-fluent-border-dark dark:bg-fluent-card-dark/40">
        <Layers className="h-8 w-8 text-fluent-text-secondaryLight opacity-40 dark:text-fluent-text-secondaryDark" />
        <p className="text-xs font-medium text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark">
          No recently opened documents
        </p>
        <p className="text-[11px] text-fluent-text-secondaryLight opacity-75 dark:text-fluent-text-secondaryDark">
          Documents you view or edit will appear here for fast access.
        </p>
      </div>
    );
  }

  return (
    <div className="select-none space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-fluent-accent" />
          <h2 className="text-sm font-semibold uppercase tracking-wide">Recent Documents</h2>
          <span className="rounded-full bg-black/5 px-2 py-0.5 font-mono text-xs dark:bg-white/5">
            {recentFiles.length}
          </span>
        </div>

        <button
          onClick={onClearRecent}
          className="flex items-center gap-1 rounded px-2 py-1 text-xs text-fluent-text-secondaryLight transition-colors hover:bg-black/5 hover:text-red-500 dark:text-fluent-text-secondaryDark dark:hover:bg-white/5"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Clear History</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
        {recentFiles.map((doc) => (
          <div
            key={doc.filePath}
            onClick={() => onSelectRecent(doc.filePath)}
            className="shadow-xs group relative flex cursor-pointer items-center justify-between gap-3 overflow-hidden rounded-xl border border-fluent-border-light bg-fluent-card-light/70 p-3.5 transition-all hover:border-fluent-accent/40 hover:shadow-md dark:border-fluent-border-dark dark:bg-fluent-card-dark/70"
          >
            <div className="flex min-w-0 items-center gap-3 truncate">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-black/5 transition-transform group-hover:scale-105 dark:bg-white/5">
                {getFormatIcon(doc.fileType)}
              </div>
              <div className="min-w-0 truncate">
                <div className="mb-0.5 flex items-center gap-2">
                  <span className="truncate text-xs font-medium transition-colors group-hover:text-fluent-accent">
                    {doc.fileName}
                  </span>
                  {getFormatBadge(doc.fileType)}
                </div>
                <p
                  className="truncate font-mono text-[11px] text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark"
                  title={doc.filePath}
                >
                  {doc.filePath}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <span className="font-mono text-[10px] text-fluent-text-secondaryLight opacity-60 dark:text-fluent-text-secondaryDark">
                {formatTimeAgo(doc.lastOpened)}
              </span>
              <button
                onClick={(e) => onRemoveRecent(doc.filePath, e)}
                title="Remove from recents"
                className="rounded p-1 text-fluent-text-secondaryLight opacity-0 transition-opacity hover:bg-black/10 hover:text-red-500 group-hover:opacity-100 dark:text-fluent-text-secondaryDark dark:hover:bg-white/10"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
