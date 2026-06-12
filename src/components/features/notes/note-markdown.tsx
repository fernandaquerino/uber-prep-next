"use client";

import { useMemo } from "react";
import { marked, Renderer } from "marked";
import { cn } from "@/lib/utils";

/** Sanitize HTML: strip script/iframe tags and inline event handlers */
function sanitizeHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/\son\w+\s*=\s*[^\s>]*/gi, "");
}

/** Build a custom marked renderer once */
function buildRenderer(): Renderer {
  const renderer = new Renderer();

  // Open external links in new tab
  renderer.link = ({
    href,
    title,
    tokens,
  }: {
    href: string;
    title?: string | null;
    tokens: { raw: string }[];
  }) => {
    const text = tokens.map((t) => t.raw).join("");
    const titleAttr = title ? ` title="${title}"` : "";
    return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`;
  };

  return renderer;
}

const renderer = buildRenderer();

marked.setOptions({
  renderer,
  gfm: true,
  breaks: false,
});

export function NoteMarkdown({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  const html = useMemo(() => {
    if (!content.trim()) return "";
    const raw = marked.parse(content, { async: false }) as string;
    return sanitizeHtml(raw);
  }, [content]);

  if (!html) {
    return (
      <div className={cn("text-muted-foreground text-sm italic", className)}>
        Nenhum conteúdo ainda.
      </div>
    );
  }

  return (
    <div
      className={cn("note-prose", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
