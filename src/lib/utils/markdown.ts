/**
 * Minimal, safe markdown renderer.
 * Handles the subset needed for flashcard front/back content.
 * Returns an HTML string — consumer is responsible for using dangerouslySetInnerHTML
 * only on content that went through this function (no user-provided URLs accepted).
 */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Convert inline markdown to HTML: bold, italic, inline code */
function renderInline(text: string): string {
  let result = escapeHtml(text);
  // Inline code — must come before bold/italic to avoid double-processing
  result = result.replace(/`([^`]+)`/g, "<code>$1</code>");
  // Bold
  result = result.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  result = result.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  // Italic
  result = result.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  result = result.replace(/_([^_]+)_/g, "<em>$1</em>");
  return result;
}

type Block =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "codeblock"; lang: string; code: string }
  | { type: "listitem"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "blank" };

function parseBlocks(input: string): Block[] {
  const lines = input.split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i]!;

    // Code block
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i]!.startsWith("```")) {
        codeLines.push(lines[i]!);
        i++;
      }
      blocks.push({ type: "codeblock", lang, code: codeLines.join("\n") });
      i++; // skip closing ```
      continue;
    }

    // Heading
    const headingMatch = line.match(/^(#{1,3})\s+(.+)/);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: Math.min(headingMatch[1]!.length, 3) as 1 | 2 | 3,
        text: headingMatch[2]!,
      });
      i++;
      continue;
    }

    // List item
    if (/^[-*]\s/.test(line)) {
      blocks.push({ type: "listitem", text: line.replace(/^[-*]\s+/, "") });
      i++;
      continue;
    }

    // Blank line
    if (line.trim() === "") {
      blocks.push({ type: "blank" });
      i++;
      continue;
    }

    // Paragraph
    const paraLines = [line];
    i++;
    while (
      i < lines.length &&
      lines[i]!.trim() !== "" &&
      !lines[i]!.startsWith("#") &&
      !lines[i]!.startsWith("```") &&
      !/^[-*]\s/.test(lines[i]!)
    ) {
      paraLines.push(lines[i]!);
      i++;
    }
    blocks.push({ type: "paragraph", text: paraLines.join(" ") });
  }

  return blocks;
}

/**
 * Convert markdown text to an HTML string.
 * Only handles: headings (h1–h3), code blocks, unordered lists,
 * paragraphs, inline code, bold, italic.
 */
export function renderMarkdown(input: string): string {
  if (!input.trim()) return "";
  const blocks = parseBlocks(input);
  const parts: string[] = [];
  let inList = false;

  for (const block of blocks) {
    if (block.type === "listitem") {
      if (!inList) {
        parts.push("<ul>");
        inList = true;
      }
      parts.push(`<li>${renderInline(block.text)}</li>`);
    } else {
      if (inList) {
        parts.push("</ul>");
        inList = false;
      }

      if (block.type === "heading") {
        parts.push(`<h${block.level}>${renderInline(block.text)}</h${block.level}>`);
      } else if (block.type === "codeblock") {
        parts.push(
          `<pre><code${block.lang ? ` class="language-${escapeHtml(block.lang)}"` : ""}>${escapeHtml(block.code)}</code></pre>`,
        );
      } else if (block.type === "paragraph") {
        parts.push(`<p>${renderInline(block.text)}</p>`);
      }
      // blank lines are ignored between blocks
    }
  }

  if (inList) parts.push("</ul>");

  return parts.join("\n");
}

/** Strip markdown from text — useful for previews and duplicate detection */
export function stripMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]+`/g, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/^#{1,3}\s+/gm, "")
    .replace(/^[-*]\s+/gm, "")
    .trim();
}
