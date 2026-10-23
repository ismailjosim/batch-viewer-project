import React from 'react';
import { Clock, Trash2, ArrowUpRight, X, FileText, FileCode, Layers } from 'lucide-react';
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
    return new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getFormatBadge = (type: DocumentType) => {
    switch (type) {
      case 'pdf':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-red-500/15 text-red-500 border border-red-500/25">
            PDF
          </span>
        );
      case 'word':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-blue-500/15 text-blue-500 border border-blue-500/25">
            DOCX
          </span>
        );
      case 'text':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
            TXT
          </span>
        );
      case 'markdown':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-purple-500/15 text-purple-400 border border-purple-500/25">
            MD
          </span>
        );
    }
  };

  const getFormatIcon = (type: DocumentType) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'word':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'text':
        return <FileCode className="w-5 h-5 text-emerald-400" />;
      case 'markdown':
      default:
        return <FileText className="w-5 h-5 text-purple-400" />;
    }
  };

  if (recentFiles.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-fluent-card-light/40 dark:bg-fluent-card-dark/40 border border-dashed border-fluent-border-light dark:border-fluent-border-dark flex flex-col items-center justify-center text-center space-y-2">
        <Layers className="w-8 h-8 text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark opacity-40" />
        <p className="text-xs font-medium text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark">
          No recently opened documents
        </p>
        <p className="text-[11px] text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark opacity-75">
          Documents you view or edit will appear here for fast access.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-fluent-accent" />
          <h2 className="text-sm font-semibold tracking-wide uppercase">Recent Documents</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 font-mono">
            {recentFiles.length}
          </span>
        </div>

        <button
          onClick={onClearRecent}
          className="text-xs text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark hover:text-red-500 flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear History</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {recentFiles.map((doc) => (
          <div
            key={doc.filePath}
            onClick={() => onSelectRecent(doc.filePath)}
            className="group relative p-3.5 rounded-xl bg-fluent-card-light/70 dark:bg-fluent-card-dark/70 border border-fluent-border-light dark:border-fluent-border-dark hover:border-fluent-accent/40 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3 overflow-hidden"
          >
            <div className="flex items-center gap-3 truncate min-w-0">
              <div className="w-9 h-9 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                {getFormatIcon(doc.fileType)}
              </div>
              <div className="truncate min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-medium text-xs truncate group-hover:text-fluent-accent transition-colors">
                    {doc.fileName}
                  </span>
                  {getFormatBadge(doc.fileType)}
                </div>
                <p className="text-[11px] text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark font-mono truncate" title={doc.filePath}>
                  {doc.filePath}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark font-mono opacity-60">
                {formatTimeAgo(doc.lastOpened)}
              </span>
              <button
                onClick={(e) => onRemoveRecent(doc.filePath, e)}
                title="Remove from recents"
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-opacity text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark hover:text-red-500"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
