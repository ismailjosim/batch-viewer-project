import React from 'react';
import appLogo from '../../assets/logo.png';

export const OverviewHero: React.FC = () => {
  return (
    <div className="flex select-none flex-col items-center space-y-3 pt-4 text-center">
      <div className="group relative">
        <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-fluent-accent to-purple-600 opacity-40 blur-md transition-opacity group-hover:opacity-75" />
        <img
          src={appLogo}
          alt="Batch-Viewer"
          className="relative h-16 w-16 rounded-full border border-white/20 bg-black/20 object-contain p-1 shadow-2xl"
        />
      </div>

      <div className="space-y-1">
        <h1 className="bg-gradient-to-r from-fluent-text-primaryLight to-fluent-accent bg-clip-text text-2xl font-bold tracking-tight text-transparent dark:from-white dark:to-fluent-accent md:text-3xl">
          Batch-Viewer
        </h1>
        <p className="max-w-md text-xs text-fluent-text-secondaryLight dark:text-fluent-text-secondaryDark md:text-sm">
          Fast, high-fidelity Document Reader, Annotator & Editor for Batch Studio
        </p>
      </div>

      {/* Supported format badges */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px]">
        <span className="flex items-center gap-1.5 rounded-full border border-fluent-border-light bg-black/5 px-2.5 py-1 opacity-80 dark:border-fluent-border-dark dark:bg-white/5">
          <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
          Markdown Reader & Editor
        </span>
        <span className="flex items-center gap-1.5 rounded-full border border-fluent-border-light bg-black/5 px-2.5 py-1 opacity-80 dark:border-fluent-border-dark dark:bg-white/5">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
          PDF Highlighting & Notes
        </span>
        <span className="flex items-center gap-1.5 rounded-full border border-fluent-border-light bg-black/5 px-2.5 py-1 opacity-80 dark:border-fluent-border-dark dark:bg-white/5">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          Word (.docx) Viewer
        </span>
        <span className="flex items-center gap-1.5 rounded-full border border-fluent-border-light bg-black/5 px-2.5 py-1 opacity-80 dark:border-fluent-border-dark dark:bg-white/5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Plain Text & Logs
        </span>
      </div>
    </div>
  );
};
