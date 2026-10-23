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
    <div className="flex-1 h-full overflow-y-auto select-none bg-gradient-to-b from-fluent-bg-light via-fluent-bg-light to-fluent-card-light/40 dark:from-[#1b1c20] dark:via-[#16171a] dark:to-[#121316] text-fluent-text-primaryLight dark:text-fluent-text-primaryDark p-6 md:p-12">
      {/* Background ambient lighting */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-fluent-accent/15 via-purple-500/10 to-transparent blur-3xl opacity-60 dark:opacity-40" />

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
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
