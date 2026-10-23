import DOMPurify from 'dompurify';

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (m) => {
    switch (m) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#39;';
      default: return m;
    }
  });
}

export async function exportMarkdownToHtml(fileName: string): Promise<{ success: boolean; path?: string; error?: string }> {
  if (!window.api) return { success: false, error: 'Electron API unavailable' };

  try {
    const cleanBaseName = fileName.replace(/\.[^/.]+$/, '') || 'Document';
    const defaultName = cleanBaseName + '.html';
    const rawHtml = document.querySelector('.markdown-body')?.innerHTML || '';
    const safeContent = DOMPurify.sanitize(rawHtml, {
      ADD_TAGS: ['mark'],
      ADD_ATTR: ['target', 'data-code', 'id', 'class'],
    });

    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(cleanBaseName)}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/github-dark.min.css">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 40px 20px;
      background: #0d1117;
      color: #c9d1d9;
      display: flex;
      justify-content: center;
    }
    .container {
      max-width: 860px;
      width: 100%;
      line-height: 1.6;
    }
    h1, h2, h3, h4, h5, h6 { color: #f0f6fc; margin-top: 24px; margin-bottom: 16px; font-weight: 600; line-height: 1.25; }
    h1 { font-size: 2em; border-bottom: 1px solid #21262d; padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; border-bottom: 1px solid #21262d; padding-bottom: 0.3em; }
    a { color: #58a6ff; text-decoration: none; }
    a:hover { text-decoration: underline; }
    code { font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, monospace; background: rgba(110,118,129,0.4); padding: 0.2em 0.4em; border-radius: 6px; font-size: 85%; }
    pre { background: #161b22; padding: 16px; border-radius: 8px; overflow: auto; border: 1px solid #30363d; }
    pre code { background: transparent; padding: 0; }
    blockquote { border-left: 0.25em solid #3b434b; color: #8b949e; padding: 0 1em; margin: 0 0 16px 0; }
    table { border-collapse: collapse; width: 100%; margin: 16px 0; }
    th, td { border: 1px solid #30363d; padding: 8px 12px; }
    th { background: #161b22; }
    img { max-width: 100%; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="container">
    ${safeContent}
  </div>
</body>
</html>`;

    return await window.api.exportHTML(defaultName, fullHtml);
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
