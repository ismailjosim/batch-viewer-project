import React from 'react';
import appLogo from '../../assets/logo.png';

export const OverviewHero: React.FC = () => {
  return (
    <div className="flex flex-col items-center text-center space-y-3 pt-4 select-none">
      <div className="relative group">
        <div className="absolute -inset-1.5 bg-gradient-to-r from-fluent-accent to-purple-600 rounded-full blur-md opacity-40 group-hover:opacity-75 transition-opacity" />
        <img
          src={appLogo}
          alt="Batch-Viewer"
          className="relative w-16 h-16 rounded-full shadow-2xl object-contain bg-black/20 p-1 border border-white/20"
        />
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-fluent-text-primaryLight to-fluent-accent dark:from-white dark:to-fluent-accent">
          Batch-Viewer
        </h1>
        <p className="text-xs md:text-sm text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark max-w-md">
          Fast, high-fidelity Document Reader, Annotator & Editor for Batch Studio
        </p>
      </div>

      {/* Supported format badges */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px]">
        <span className="px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-fluent-border-light dark:border-fluent-border-dark flex items-center gap-1.5 opacity-80">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
          Markdown Reader & Editor
        </span>
        <span className="px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-fluent-border-light dark:border-fluent-border-dark flex items-center gap-1.5 opacity-80">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          PDF Highlighting & Notes
        </span>
        <span className="px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-fluent-border-light dark:border-fluent-border-dark flex items-center gap-1.5 opacity-80">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          Word (.docx) Viewer
        </span>
        <span className="px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-fluent-border-light dark:border-fluent-border-dark flex items-center gap-1.5 opacity-80">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Plain Text & Logs
        </span>
      </div>
    </div>
  );
};
