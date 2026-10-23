# Batch-Viewer — Fast Markdown Viewer & Editor (Batch Studio)

> A lightweight, modern Markdown Viewer and Editor built under the **Batch Studio** suite for Windows 11.

![Batch-Viewer Preview](https://img.shields.io/badge/Batch%20Studio-Batch--Viewer-0078d4?style=for-the-badge&logo=windows)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## ✨ Features

### 📑 1. Multi-Document Tab System

- **Tabbed Interface**: Open multiple files simultaneously (Markdown, PDF, Word, Text).
- **Tab Navigation**: Seamlessly switch tabs with mouse or `Ctrl + Tab`.
- **Dirty State Indicator**: Visual dot indicator (`•`) on tabs with unsaved edits.
- **Quick Shortcuts**: `Ctrl + N` for new tab, `Ctrl + W` to close tab.

### 📕 2. PDF Viewer, Highlight Annotator & Page Comments

- **High-Resolution Canvas**: Crisp page rendering with page-by-page scrolling.
- **Interactive Highlight Tool**: Select tool and drag over text/areas to highlight in customizable colors (Yellow, Blue, Pink, Green).
- **Page Comments / Notes**: Click anywhere on a page to drop an annotation pin and leave detailed feedback notes.
- **Permanent PDF Saving (`Ctrl + S`)**: Powered by `pdf-lib` to bake highlights and comment markers directly into the `.pdf` file so other PDF viewers (Adobe Acrobat, Edge, Chrome) see your annotations!

### 📘 3. Word & Google Docs (.docx) Viewer & Editor

- **Authentic Page Layout**: Renders `.docx` documents in an A4 paper sheet view with typography, tables, and lists powered by Mammoth.
- **Reading / Editing View**: Toggle between pure reader view and editable document mode.
- **Save as PDF**: Export Word documents directly to PDF with one click.

### 📝 4. Text (.txt, .log, .json, .csv) Editor

- Monospace plain-text viewing and editing with line numbers and full search support (`Ctrl + F`).

### 🛠️ 5. Markdown Formatting Toolbar

- Visual formatting bar above the editor:
  - Headings (H1, H2, H3)
  - Bold, Italic, Strikethrough
  - Bullet Lists, Numbered Lists, Task Checklists (`- [ ]`)
  - Quotes, Inline Code, Code Blocks
  - Links, Images, Tables, Horizontal Rules
  - LaTeX Math equations (`$$...$$`)
  - Mermaid Flowcharts & Architecture diagrams

### 🔄 6. Version & Auto-Update Checker

- Check for updates button in the Status Bar displaying version information and status notifications.

---

## ⌨️ Keyboard Shortcuts

| Shortcut                | Action                                                    |
| :---------------------- | :-------------------------------------------------------- |
| `Ctrl + O`              | Open file(s) from disk                                    |
| `Ctrl + S`              | Save file changes (saves PDF with highlights & comments!) |
| `Ctrl + N`              | Open new document tab                                     |
| `Ctrl + W`              | Close current tab                                         |
| `Ctrl + Tab`            | Switch to next tab                                        |
| `Ctrl + E`              | Toggle View / Split / Edit mode (Markdown)                |
| `Ctrl + F`              | Find in document                                          |
| `Ctrl + +` / `Ctrl + =` | Zoom In                                                   |
| `Ctrl + -`              | Zoom Out                                                  |
| `Ctrl + 0`              | Reset Zoom to 100%                                        |
| `Ctrl + B`              | Format bold                                               |
| `Ctrl + I`              | Format italic                                             |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18+ (tested on Node.js v24)
- **npm**: v9+

### Installation

```powershell
npm install
```

### Run in Development

```powershell
npm run dev
```

### Production Build

```powershell
npm run build
```

---

## 🏪 Microsoft Store Packaging Guide

This app is configured with `electron-builder` to produce both a standard Windows installer (`.exe`) and an **MSIX / AppX** bundle for the Microsoft Store.

### 1. Build Local Unpacked Package

```powershell
npm run pack
```

Find the output in the `release/` folder.

### 2. Build Windows Installer & AppX / MSIX

```powershell
npm run dist
```

### 3. Microsoft Store Partner Center Steps

1. Register a developer account at [Microsoft Partner Center](https://partner.microsoft.com/dashboard).
2. Go to **Apps and games** > **New product** > **MSIX or PWA app**.
3. Reserve your app name (e.g., `Batch-Viewer` or `Batch Studio Markdown Viewer`).
4. In `electron-builder.json`, update the `identityName` and `publisherDisplayName` to match your Partner Center account details:
   ```json
   "appx": {
     "identityName": "BatchStudio.BatchViewer",
     "applicationId": "BatchViewer",
     "publisherDisplayName": "YOUR_PUBLISHER_DISPLAY_NAME"
   }
   ```
5. Run the **Windows App Certification Kit (WACK)** on the generated `.msix` / `.appx`:
   ```powershell
   appcert.exe test -appxpackagepath <path-to-msix> -reportoutputpath <path-to-report.xml>
   ```
6. Upload the `.msix` bundle to Partner Center and submit for certification.
