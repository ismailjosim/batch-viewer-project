export type DocumentType = 'markdown' | 'pdf' | 'word' | 'text';

export interface PdfHighlight {
  id: string;
  pageNumber: number; // 1-indexed
  xPct: number; // percentage of page width (0 to 1) for responsive scaling
  yPct: number; // percentage of page height (0 to 1)
  widthPct: number;
  heightPct: number;
  color: string; // e.g. '#ffe066', '#a5d8ff', '#ffc9c9', '#b2f2bb'
  text?: string;
}

export interface PdfComment {
  id: string;
  pageNumber: number; // 1-indexed
  xPct: number;
  yPct: number;
  text: string;
  author: string;
  createdAt: string;
}

export interface RecentDocument {
  filePath: string;
  fileName: string;
  fileType: DocumentType;
  lastOpened: number;
}

export interface FolderFileItem {
  name: string;
  path: string;
  fileType: DocumentType;
  size: number;
}

export interface WorkspaceFolder {
  dirPath: string;
  folderName: string;
  files: FolderFileItem[];
}

export interface DocumentTab {
  id: string;
  filePath: string | null;
  fileName: string;
  fileType: DocumentType;
  content: string; // Text / Markdown source or Word HTML
  originalContent: string;
  base64Data?: string; // Raw binary for PDF
  dirName?: string;
  isDirty: boolean;
  pdfHighlights?: PdfHighlight[];
  pdfComments?: PdfComment[];
  zoom?: number;
  currentPage?: number;
}

export function detectFileType(fileNameOrPath: string): DocumentType {
  const lower = fileNameOrPath.toLowerCase();
  if (lower.endsWith('.pdf')) return 'pdf';
  if (lower.endsWith('.docx') || lower.endsWith('.doc')) return 'word';
  if (
    lower.endsWith('.txt') ||
    lower.endsWith('.log') ||
    lower.endsWith('.csv') ||
    lower.endsWith('.json') ||
    lower.endsWith('.yaml') ||
    lower.endsWith('.yml') ||
    lower.endsWith('.xml')
  ) {
    return 'text';
  }
  return 'markdown';
}
