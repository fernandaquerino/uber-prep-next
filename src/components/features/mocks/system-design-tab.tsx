"use client";

import { useState, useCallback, useRef } from "react";
import { useSystemDesign, useSystemDesignActions } from "@/hooks/use-system-design";
import type { SystemDesignTemplateData } from "@/lib/data/system-design-templates";
import type { SystemDesignDraft } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "bg-green-500/15 text-green-700 dark:text-green-400",
  medium: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400",
  hard: "bg-red-500/15 text-red-700 dark:text-red-400",
};

export function SystemDesignTab({ onRefresh }: { onRefresh: () => void }) {
  const { templates, drafts, refresh } = useSystemDesign();
  const {
    saveDraft,
    resetDraft,
    registerAsMock,
    isLoading: saving,
  } = useSystemDesignActions(() => {
    refresh();
    onRefresh();
  });

  const [activeTemplateId, setActiveTemplateId] = useState<string>(templates[0]?.id ?? "");
  const [resetConfirm, setResetConfirm] = useState(false);

  const activeTemplate = templates.find((t) => t.id === activeTemplateId) ?? templates[0] ?? null;
  const activeDraft = activeTemplate ? (drafts.get(activeTemplate.id) ?? null) : null;

  if (!activeTemplate)
    return <div className="text-muted-foreground p-4 text-sm">Nenhum template disponível.</div>;

  const filledSections = activeTemplate.sections.filter((s) =>
    activeDraft?.answers[s.id]?.trim(),
  ).length;
  const progressPct =
    activeTemplate.sections.length > 0
      ? Math.round((filledSections / activeTemplate.sections.length) * 100)
      : 0;

  return (
    <div className="space-y-4">
      {/* Template tabs */}
      <div className="flex flex-wrap gap-2">
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTemplateId(t.id)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
              activeTemplateId === t.id
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border hover:bg-accent",
            )}
          >
            {t.title}
          </button>
        ))}
      </div>

      {/* Template meta */}
      <div className="space-y-1">
        <p className="text-muted-foreground text-sm">{activeTemplate.description}</p>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "rounded px-1.5 py-0.5 text-xs font-medium",
              DIFFICULTY_COLORS[activeTemplate.difficulty] ?? "",
            )}
          >
            {activeTemplate.difficulty}
          </span>
          {activeTemplate.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          <span className="text-muted-foreground text-xs">{progressPct}% completo</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => setResetConfirm(true)} disabled={saving}>
          <RotateCcw className="mr-1 h-3.5 w-3.5" />
          Apagar rascunho
        </Button>
        <Button size="sm" onClick={() => registerAsMock(activeTemplate.id)} disabled={saving}>
          Registrar como mock
        </Button>
        {activeDraft?.linkedMockId && (
          <span className="text-muted-foreground self-center text-xs">Mock vinculado</span>
        )}
      </div>

      {/* Editor — keyed so it remounts when template switches, resetting state from props */}
      <TemplateEditor
        key={activeTemplate.id}
        template={activeTemplate}
        draft={activeDraft}
        onSave={(answers, checklist) => saveDraft(activeTemplate.id, answers, checklist)}
      />

      {/* Reset confirm */}
      <AlertDialog open={resetConfirm} onOpenChange={setResetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apagar rascunho?</AlertDialogTitle>
            <AlertDialogDescription>
              Todo o conteúdo digitado neste template será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={async () => {
                await resetDraft(activeTemplate.id);
                setResetConfirm(false);
              }}
            >
              Apagar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Template editor ───────────────────────────────────────────────────────────

type TemplateEditorProps = {
  template: SystemDesignTemplateData;
  draft: SystemDesignDraft | null;
  onSave: (answers: Record<string, string>, checklist: Record<string, boolean>) => Promise<unknown>;
};

function TemplateEditor({ template, draft, onSave }: TemplateEditorProps) {
  const [answers, setAnswers] = useState<Record<string, string>>(draft?.answers ?? {});
  const [checklist, setChecklist] = useState<Record<string, boolean>>(draft?.checklistState ?? {});
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "dirty">("saved");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerSave = useCallback(
    (newAnswers: Record<string, string>, newChecklist: Record<string, boolean>) => {
      setSaveStatus("dirty");
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        setSaveStatus("saving");
        await onSave(newAnswers, newChecklist);
        setSaveStatus("saved");
      }, 1500);
    },
    [onSave],
  );

  const handleAnswer = useCallback(
    (sectionId: string, value: string) => {
      setAnswers((prev) => {
        const next = { ...prev, [sectionId]: value };
        triggerSave(next, checklist);
        return next;
      });
    },
    [checklist, triggerSave],
  );

  const handleChecklist = useCallback(
    (itemId: string, checked: boolean) => {
      setChecklist((prev) => {
        const next = { ...prev, [itemId]: checked };
        triggerSave(answers, next);
        return next;
      });
    },
    [answers, triggerSave],
  );

  const sortedSections = [...template.sections].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <span
          className={cn(
            "text-xs",
            saveStatus === "saved" ? "text-green-600 dark:text-green-400" : "text-muted-foreground",
          )}
        >
          {saveStatus === "saving" ? "Salvando..." : saveStatus === "dirty" ? "Não salvo" : "Salvo"}
        </span>
      </div>

      {/* Sections */}
      {sortedSections.map((section) => (
        <div key={section.id} className="space-y-1">
          <Label className="text-muted-foreground text-xs tracking-wide uppercase">
            {section.title}
            {section.required && <span className="text-destructive ml-0.5">*</span>}
          </Label>
          {section.description && (
            <p className="text-muted-foreground text-xs">{section.description}</p>
          )}
          <Textarea
            rows={5}
            placeholder={section.placeholder}
            value={answers[section.id] ?? ""}
            onChange={(e) => handleAnswer(section.id, e.target.value)}
          />
        </div>
      ))}

      {/* Checklist */}
      {template.checklist.length > 0 && (
        <div className="space-y-2 pt-2">
          <Label className="text-muted-foreground text-xs tracking-wide uppercase">Checklist</Label>
          <div className="text-muted-foreground text-sm leading-relaxed">
            {template.checklist.map((item, i) => {
              const itemId = `cl-${i}`;
              return (
                <span key={itemId} className="mr-3 inline-flex items-center gap-1">
                  <Checkbox
                    id={itemId}
                    checked={!!checklist[itemId]}
                    onCheckedChange={(v) => handleChecklist(itemId, !!v)}
                    className="h-3.5 w-3.5"
                  />
                  <label
                    htmlFor={itemId}
                    className={cn(
                      "cursor-pointer",
                      checklist[itemId] && "text-muted-foreground/50 line-through",
                    )}
                  >
                    {item}
                  </label>
                  {i < template.checklist.length - 1 && (
                    <span className="text-muted-foreground/40 ml-1">·</span>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
