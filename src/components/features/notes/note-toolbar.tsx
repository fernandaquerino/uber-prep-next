"use client";

import type { RefObject } from "react";
import {
  Bold,
  Code,
  Code2,
  Heading2,
  Heading3,
  Italic,
  LayoutTemplate,
  List,
  ListOrdered,
  Minus,
  Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export type ToolbarProps = {
  editorRef: RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (value: string) => void;
  onInsertTemplate?: () => void;
};

type WrapConfig = {
  before: string;
  after: string;
  defaultText?: string;
};

type InsertConfig = {
  text: string;
};

type FormatConfig = WrapConfig | InsertConfig;

function isInsert(config: FormatConfig): config is InsertConfig {
  return "text" in config;
}

function applyFormat(
  value: string,
  selStart: number,
  selEnd: number,
  config: FormatConfig,
): { newValue: string; newStart: number; newEnd: number } {
  if (isInsert(config)) {
    const newValue = value.slice(0, selStart) + config.text + value.slice(selEnd);
    const newPos = selStart + config.text.length;
    return { newValue, newStart: newPos, newEnd: newPos };
  }

  const { before, after, defaultText = "texto" } = config;
  const selected = value.slice(selStart, selEnd) || defaultText;
  const replacement = before + selected + after;
  const newValue = value.slice(0, selStart) + replacement + value.slice(selEnd);

  const newStart = selStart + before.length;
  const newEnd =
    newStart + (value.slice(selStart, selEnd) ? selEnd - selStart : defaultText.length);
  return { newValue, newStart, newEnd };
}

function useFormatAction(
  editorRef: RefObject<HTMLTextAreaElement | null>,
  value: string,
  onChange: (value: string) => void,
) {
  return (config: FormatConfig) => {
    const el = editorRef.current;
    if (!el) return;

    const selStart = el.selectionStart;
    const selEnd = el.selectionEnd;
    const { newValue, newStart, newEnd } = applyFormat(value, selStart, selEnd, config);

    onChange(newValue);

    // Restore selection after React re-render
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(newStart, newEnd);
    });
  };
}

type ToolbarButton = {
  icon: React.ReactNode;
  title: string;
  config: FormatConfig;
};

export function NoteToolbar({ editorRef, value, onChange, onInsertTemplate }: ToolbarProps) {
  const format = useFormatAction(editorRef, value, onChange);

  const buttons: ToolbarButton[] = [
    {
      icon: <Bold className="h-3.5 w-3.5" />,
      title: "Negrito (Cmd+B)",
      config: { before: "**", after: "**", defaultText: "negrito" },
    },
    {
      icon: <Italic className="h-3.5 w-3.5" />,
      title: "Itálico (Cmd+I)",
      config: { before: "_", after: "_", defaultText: "itálico" },
    },
    {
      icon: <Code className="h-3.5 w-3.5" />,
      title: "Código inline",
      config: { before: "`", after: "`", defaultText: "código" },
    },
  ];

  const headingButtons: ToolbarButton[] = [
    {
      icon: <Heading2 className="h-3.5 w-3.5" />,
      title: "Título H2",
      config: { before: "## ", after: "", defaultText: "Título" },
    },
    {
      icon: <Heading3 className="h-3.5 w-3.5" />,
      title: "Título H3",
      config: { before: "### ", after: "", defaultText: "Subtítulo" },
    },
  ];

  const listButtons: ToolbarButton[] = [
    {
      icon: <List className="h-3.5 w-3.5" />,
      title: "Lista não ordenada",
      config: { text: "\n- item\n" },
    },
    {
      icon: <ListOrdered className="h-3.5 w-3.5" />,
      title: "Lista ordenada",
      config: { text: "\n1. item\n" },
    },
    {
      icon: <Quote className="h-3.5 w-3.5" />,
      title: "Citação",
      config: { before: "> ", after: "", defaultText: "citação" },
    },
  ];

  const extraButtons: ToolbarButton[] = [
    {
      icon: <Minus className="h-3.5 w-3.5" />,
      title: "Separador horizontal",
      config: { text: "\n\n---\n\n" },
    },
    {
      icon: <Code2 className="h-3.5 w-3.5" />,
      title: "Bloco de código",
      config: { before: "\n```javascript\n", after: "\n```\n", defaultText: "// código aqui" },
    },
  ];

  const allGroups = [buttons, headingButtons, listButtons, extraButtons];

  return (
    <TooltipProvider>
      <div className="border-border bg-muted/30 flex flex-wrap items-center gap-1 border-b px-2 py-1.5">
        {allGroups.map((group, gi) => (
          <span key={gi} className="flex items-center gap-0.5">
            {gi > 0 && <Separator orientation="vertical" className="mx-1 h-4" />}
            {group.map((btn) => (
              <Tooltip key={btn.title}>
                <TooltipTrigger
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => format(btn.config)}
                      aria-label={btn.title}
                    />
                  }
                >
                  {btn.icon}
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">{btn.title}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </span>
        ))}

        {onInsertTemplate && (
          <>
            <Separator orientation="vertical" className="mx-1 h-4" />
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1.5 px-2 text-xs"
                    onClick={onInsertTemplate}
                    aria-label="Inserir template"
                  />
                }
              >
                <LayoutTemplate className="h-3.5 w-3.5" />
                Template
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">Inserir template de nota</p>
              </TooltipContent>
            </Tooltip>
          </>
        )}
      </div>
    </TooltipProvider>
  );
}
