"use client";

import type { FlashcardSummaryViewModel } from "@/lib/presentation/flashcards/flashcard-view-model";
import { Archive, BookOpen, Brain, CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type SummaryCardProps = {
  label: string;
  value: number;
  icon: React.ReactNode;
  highlight?: boolean;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
};

function SummaryCard({
  label,
  value,
  icon,
  highlight,
  isActive,
  onClick,
  className,
}: SummaryCardProps) {
  const Component = onClick ? "button" : "div";

  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "flex min-h-20 flex-col gap-1 rounded-lg border p-3 text-left",
        onClick ? "cursor-pointer transition-colors hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" : "",
        isActive ? "border-primary bg-primary/5" : "",
        highlight && value > 0 ? "border-orange-300 bg-orange-50 dark:border-orange-700 dark:bg-orange-900/20" : "",
        className,
      )}
      aria-pressed={onClick ? isActive : undefined}
    >
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <span className={cn("text-xl font-bold", highlight && value > 0 ? "text-orange-600 dark:text-orange-400" : "")}>
        {value}
      </span>
    </Component>
  );
}

type SummaryFilter =
  | "due"
  | "new"
  | "learning"
  | "reviewing"
  | "mastered"
  | "archived";

export function FlashcardSummaryCards({
  summary,
  activeFilter,
  onSelect,
}: {
  summary: FlashcardSummaryViewModel;
  activeFilter?: SummaryFilter;
  onSelect?: (filter: SummaryFilter) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
      <SummaryCard
        label="Para revisar"
        value={summary.due}
        icon={<Brain className="h-3.5 w-3.5" aria-hidden />}
        highlight
        isActive={activeFilter === "due"}
        onClick={onSelect ? () => onSelect("due") : undefined}
      />
      <SummaryCard
        label="Novos"
        value={summary.newCards}
        icon={<Sparkles className="h-3.5 w-3.5" aria-hidden />}
        isActive={activeFilter === "new"}
        onClick={onSelect ? () => onSelect("new") : undefined}
      />
      <SummaryCard
        label="Aprendendo"
        value={summary.learning}
        icon={<BookOpen className="h-3.5 w-3.5" aria-hidden />}
        isActive={activeFilter === "learning"}
        onClick={onSelect ? () => onSelect("learning") : undefined}
      />
      <SummaryCard
        label="Revisando"
        value={summary.reviewing}
        icon={<BookOpen className="h-3.5 w-3.5" aria-hidden />}
        isActive={activeFilter === "reviewing"}
        onClick={onSelect ? () => onSelect("reviewing") : undefined}
      />
      <SummaryCard
        label="Dominados"
        value={summary.mastered}
        icon={<CheckCircle2 className="h-3.5 w-3.5" aria-hidden />}
        isActive={activeFilter === "mastered"}
        onClick={onSelect ? () => onSelect("mastered") : undefined}
      />
      <SummaryCard
        label="Arquivados"
        value={summary.archived}
        icon={<Archive className="h-3.5 w-3.5" aria-hidden />}
        isActive={activeFilter === "archived"}
        onClick={onSelect ? () => onSelect("archived") : undefined}
      />
    </div>
  );
}
