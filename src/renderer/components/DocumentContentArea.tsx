import React from "react";
import { OverviewPage } from "./OverviewPage";
import { PdfViewer } from "./PdfViewer";
import { WordViewer } from "./WordViewer";
import { TextEditor } from "./TextEditor";
import { Editor } from "./Editor";
import { MarkdownViewer } from "./MarkdownViewer";
import {
  DocumentTab,
  RecentDocument,
  PdfHighlight,
  PdfComment,
} from "../types";

interface DocumentContentAreaProps {
  isOverviewActive: boolean;
  activeTab?: DocumentTab | null;
  viewMode: "view" | "split" | "edit";
  theme: "light" | "dark";
  zoom: number;
  recentFiles: RecentDocument[];
  viewerContainerRef: React.RefObject<HTMLDivElement | null>;
  externalScrollPct: number | null;
  onOpenFile: () => void;
  onOpenFolder: () => void;
  onNewDocument: () => void;
  onSelectRecent: (filePath: string) => void;
  onRemoveRecent: (filePath: string, e: React.MouseEvent) => void;
  onClearRecent: () => void;
  onAnnotationsChange: (
    highlights: PdfHighlight[],
    comments: PdfComment[],
  ) => void;
  onSavePdf: (modifiedBase64: string) => Promise<void>;
  onContentChange: (content: string) => void;
  onExportPDF: () => void;
  onEditorScroll: (pct: number) => void;
  onViewerScroll: (e: React.UIEvent<HTMLDivElement>) => void;
}

export const DocumentContentArea: React.FC<DocumentContentAreaProps> = ({
  isOverviewActive,
  activeTab,
  viewMode,
  theme,
  zoom,
  recentFiles,
  viewerContainerRef,
  externalScrollPct,
  onOpenFile,
  onOpenFolder,
  onNewDocument,
  onSelectRecent,
  onRemoveRecent,
  onClearRecent,
  onAnnotationsChange,
  onSavePdf,
  onContentChange,
  onExportPDF,
  onEditorScroll,
  onViewerScroll,
}) => {
  if (isOverviewActive || !activeTab) {
    return (
      <OverviewPage
        recentFiles={recentFiles}
        onOpenFile={onOpenFile}
        onOpenFolder={onOpenFolder}
        onNewDocument={onNewDocument}
        onSelectRecent={onSelectRecent}
        onRemoveRecent={onRemoveRecent}
        onClearRecent={onClearRecent}
      />
    );
  }

  if (activeTab.fileType === "pdf" && activeTab.base64Data) {
    return (
      <PdfViewer
        base64Data={activeTab.base64Data}
        filePath={activeTab.filePath}
        highlights={activeTab.pdfHighlights || []}
        comments={activeTab.pdfComments || []}
        zoom={zoom}
        onAnnotationsChange={onAnnotationsChange}
        onSavePdf={onSavePdf}
      />
    );
  }

  if (activeTab.fileType === "word") {
    return (
      <WordViewer
        base64Data={activeTab.base64Data}
        initialHtml={activeTab.content}
        fileName={activeTab.fileName}
        zoom={zoom}
        onContentChange={onContentChange}
        onSaveAsPdf={onExportPDF}
      />
    );
  }

  if (activeTab.fileType === "text") {
    return (
      <TextEditor
        content={activeTab.content}
        onChange={onContentChange}
        zoom={zoom}
      />
    );
  }

  return (
    <>
      {(viewMode === "edit" || viewMode === "split") && (
        <div
          className={`h-full overflow-hidden ${
            viewMode === "split"
              ? "w-1/2 border-r border-fluent-border-light dark:border-fluent-border-dark"
              : "w-full"
          }`}
        >
          <Editor
            content={activeTab.content || ""}
            onChange={onContentChange}
            zoom={zoom}
            onScroll={viewMode === "split" ? onEditorScroll : undefined}
            externalScrollPct={viewMode === "split" ? externalScrollPct : null}
          />
        </div>
      )}
      {(viewMode === "view" || viewMode === "split") && (
        <div
          ref={viewerContainerRef as React.RefObject<HTMLDivElement>}
          onScroll={viewMode === "split" ? onViewerScroll : undefined}
          className={`h-full overflow-y-auto ${viewMode === "split" ? "w-1/2" : "w-full"}`}
        >
          <MarkdownViewer
            content={activeTab.content || ""}
            dirName={activeTab.dirName}
            theme={theme}
            zoom={zoom}
          />
        </div>
      )}
    </>
  );
};
