import React from 'react';
import { RecentDocument } from '../types';
import { OverviewHero } from './overview/OverviewHero';
import { OverviewActions } from './overview/OverviewActions';
import { OverviewRecents } from './overview/OverviewRecents';

interface OverviewPageProps {
  recentFiles: RecentDocument[];
  onOpenFile: () => void;
  onOpenFolder: () => void;
  onNewDocument: () => void;
  onSelectRecent: (filePath: string) => void;
  onRemoveRecent: (filePath: string, e: React.MouseEvent) => void;
  onClearRecent: () => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  recentFiles,
  onOpenFile,
  onOpenFolder,
  onNewDocument,
  onSelectRecent,
  onRemoveRecent,
  onClearRecent,
}) => {
  return (
    <div className="h-full flex-1 select-none overflow-y-auto bg-gradient-to-b from-fluent-bg-light via-fluent-bg-light to-fluent-card-light/40 p-6 text-fluent-text-primaryLight dark:from-[#1b1c20] dark:via-[#16171a] dark:to-[#121316] dark:text-fluent-text-primaryDark md:p-12">
      {/* Background ambient lighting */}
      <div className="pointer-events-none fixed left-1/2 top-0 h-[350px] w-[700px] -translate-x-1/2 bg-gradient-to-b from-fluent-accent/15 via-purple-500/10 to-transparent opacity-60 blur-3xl dark:opacity-40" />

      <div className="relative z-10 mx-auto max-w-4xl space-y-8">
        {/* 1. Hero Header */}
        <OverviewHero />

        {/* 2. Primary Actions: Open File / Open Folder / New Document */}
        <OverviewActions
          onOpenFile={onOpenFile}
          onOpenFolder={onOpenFolder}
          onNewDocument={onNewDocument}
        />

        {/* 3. Recent Documents List */}
        <OverviewRecents
          recentFiles={recentFiles}
          onSelectRecent={onSelectRecent}
          onRemoveRecent={onRemoveRecent}
          onClearRecent={onClearRecent}
        />
      </div>
    </div>
  );
};
