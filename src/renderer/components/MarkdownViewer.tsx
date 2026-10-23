import React, { useEffect, useRef, useMemo } from "react";
import { Marked } from "marked";
import markedKatex from "marked-katex-extension";
import hljs from "highlight.js";
import mermaid from "mermaid";
import DOMPurify from "dompurify";

interface MarkdownViewerProps {
  content: string;
  dirName?: string;
  theme: "light" | "dark";
  zoom: number;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({
  content,
  dirName,
  theme,
  zoom,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize mermaid on mount or theme change
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: theme === "dark" ? "dark" : "neutral",
      securityLevel: "strict",
      fontFamily: "Segoe UI, system-ui, sans-serif",
    });
  }, [theme]);

  const htmlContent = useMemo(() => {
    const marked = new Marked();

    // LaTeX Math extension
    marked.use(markedKatex({ throwOnError: false }));

    // Custom renderer for code, headings, and images
    marked.use({
      renderer: {
        code({ text, lang }: { text: string; lang?: string }) {
          if (lang === "mermaid") {
            return `<div class="mermaid-container"><pre class="mermaid">${DOMPurify.sanitize(text)}</pre></div>`;
          }

          const validLang = lang && hljs.getLanguage(lang) ? lang : undefined;
          let highlighted = "";
          try {
            if (validLang) {
              highlighted = hljs.highlight(text, { language: validLang }).value;
            } else {
              highlighted = hljs.highlightAuto(text).value;
            }
          } catch {
            highlighted = DOMPurify.sanitize(text);
          }

          const encodedCode = encodeURIComponent(text);
          return `
            <div class="code-wrapper relative my-4 rounded-lg overflow-hidden border border-fluent-border-light dark:border-fluent-border-dark shadow-sm">
              <div class="code-header flex items-center justify-between px-3 py-1.5 bg-[#252526] text-gray-300 text-xs border-b border-[#383838] select-none">
                <span class="font-mono text-[11px] uppercase tracking-wider text-gray-400">${lang || "text"}</span>
                <button class="copy-btn px-2 py-0.5 rounded bg-gray-700/60 hover:bg-gray-600 text-[11px] text-gray-200 transition-colors" data-code="${encodedCode}">
                  Copy
                </button>
              </div>
              <pre class="!m-0 !p-3 !bg-[#1e1e1e]"><code class="hljs language-${lang || "plaintext"}">${highlighted}</code></pre>
            </div>
          `;
        },
        heading({ text, depth }: { text: string; depth: number }) {
          const rawText = text.replace(/<[^>]+>/g, "");
          const id = rawText
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-");
          return `<h${depth} id="${id}" class="scroll-mt-4">${text}</h${depth}>`;
        },
        image({
          href,
          title,
          text,
        }: {
          href: string;
          title?: string | null;
          text: string;
        }) {
          let resolvedHref = href;
          if (
            dirName &&
            !href.startsWith("http://") &&
            !href.startsWith("https://") &&
            !href.startsWith("data:")
          ) {
            const cleanDir = dirName.replace(/\\/g, "/");
            const cleanHref = href.replace(/\\/g, "/");
            const fullPath = cleanHref.startsWith("/")
              ? cleanHref
              : `${cleanDir}/${cleanHref}`;
            resolvedHref = `file:///${fullPath}`;
          }
          const safeHref = DOMPurify.sanitize(resolvedHref);
          const safeAlt = (text || "").replace(/"/g, "&quot;");
          const safeTitle = (title || "").replace(/"/g, "&quot;");
          return `<img src="${safeHref}" alt="${safeAlt}" title="${safeTitle}" class="max-w-full rounded-md shadow-sm my-4" />`;
        },
      },
    });

    const rawHtml = marked.parse(content || "") as string;
    return DOMPurify.sanitize(rawHtml, {
      ADD_TAGS: ["mark"],
      ADD_ATTR: ["target", "data-code", "id", "class"],
    });
  }, [content, dirName]);

  // Handle Mermaid rendering, Copy button clicks, and secure Link navigation
  useEffect(() => {
    if (!containerRef.current) return;

    // Render Mermaid diagrams safely
    const mermaidElements = containerRef.current.querySelectorAll(".mermaid");
    if (mermaidElements.length > 0) {
      try {
        mermaid
          .run({
            nodes: Array.from(mermaidElements) as HTMLElement[],
          })
          .catch((err) => {
            console.warn("Mermaid render error:", err);
          });
      } catch (err) {
        console.warn("Mermaid execution error:", err);
      }
    }

    const handlers: Array<{ el: Element; type: string; fn: EventListener }> =
      [];

    // Intercept Links to prevent in-app navigation hijack
    const linkElements = containerRef.current.querySelectorAll("a");
    linkElements.forEach((link) => {
      const clickHandler: EventListener = (e: Event) => {
        const href = link.getAttribute("href");
        if (href) {
          e.preventDefault();
          if (href.startsWith("#")) {
            const targetEl = containerRef.current?.querySelector(href);
            targetEl?.scrollIntoView({ behavior: "smooth" });
          } else if (window.api) {
            window.api.openExternal(href);
          }
        }
      };
      link.addEventListener("click", clickHandler);
      handlers.push({ el: link, type: "click", fn: clickHandler });
    });

    // Attach Copy event listeners
    const copyButtons = containerRef.current.querySelectorAll(".copy-btn");
    copyButtons.forEach((btn) => {
      const copyHandler: EventListener = () => {
        const encoded = btn.getAttribute("data-code");
        if (encoded) {
          navigator.clipboard.writeText(decodeURIComponent(encoded));
          const originalText = btn.textContent;
          btn.textContent = "Copied!";
          btn.classList.add("bg-green-600", "text-white");
          setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove("bg-green-600", "text-white");
          }, 1500);
        }
      };
      btn.addEventListener("click", copyHandler);
      handlers.push({ el: btn, type: "click", fn: copyHandler });
    });

    return () => {
      handlers.forEach(({ el, type, fn }) => {
        el.removeEventListener(type, fn);
      });
    };
  }, [htmlContent]);

  return (
    <div
      ref={containerRef}
      style={{ zoom: zoom }}
      className="markdown-body p-6 md:p-10 max-w-6xl mx-auto w-full select-text leading-relaxed"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};
