"use client";

import type { KeyboardEvent } from "react";
import type { FlashcardViewModel } from "@/lib/presentation/flashcards/flashcard-view-model";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Archive, Trash2, RotateCcw, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { renderMarkdown } from "@/lib/utils/markdown";

type Props = {
  card: FlashcardViewModel;
  onOpen?: (id: string) => void;
  onEdit?: (id: string) => void;
  onArchive?: (id: string) => void;
  onRestore?: (id: string) => void;
  onDelete?: (id: string) => void;
};

export function FlashcardCard({ card, onOpen, onEdit, onArchive, onRestore, onDelete }: Props) {
  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (!onOpen) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen(card.id);
    }
  }

  return (
    <article
      className={cn(
        "group flex flex-col gap-3 rounded-lg border p-4 transition-colors",
        onOpen ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" : "",
        card.lifecycleStatus === "archived" ? "opacity-60" : "hover:border-primary/50",
        card.isDueToday ? "border-l-4 border-l-orange-400" : "",
      )}
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onClick={() => onOpen?.(card.id)}
      onKeyDown={handleKeyDown}
      aria-label={`Flashcard: ${card.front.slice(0, 60)}`}
    >
      {/* Category + state badges */}
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant="outline" className={cn("text-xs", card.categoryBadge)}>
          {card.categoryLabel}
        </Badge>
        <Badge variant="outline" className={cn("text-xs", card.learningStateBadge)}>
          {card.learningStateLabel}
        </Badge>
        {card.daysOverdue > 0 && (
          <Badge variant="outline" className="border-orange-300 bg-orange-50 text-xs text-orange-700 dark:border-orange-700 dark:bg-orange-900/20 dark:text-orange-400">
            <Clock className="mr-0.5 h-3 w-3" aria-hidden />
            {card.overdueLabel}
          </Badge>
        )}
      </div>

      {/* Front */}
      <div
        className="text-sm font-medium"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(card.front) }}
        aria-label="Pergunta"
      />

      <p className="text-muted-foreground text-sm">Clique para revelar a resposta</p>

      {/* Tags */}
      {card.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {card.tags.map((tag) => (
            <span key={tag} className="text-muted-foreground rounded text-xs">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer: next review + actions */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-muted-foreground text-xs">
          {card.nextReviewDate ? `Próxima revisão: ${card.nextReviewFormatted}` : "Não revisado"}
        </span>

        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          {card.lifecycleStatus === "active" ? (
            <>
              {onEdit && (
	                <Button
	                  variant="ghost"
	                  size="icon"
	                  className="h-7 w-7"
	                  onClick={(event) => {
	                    event.stopPropagation();
	                    onEdit(card.id);
	                  }}
	                  aria-label="Editar flashcard"
	                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden />
                </Button>
              )}
              {onArchive && (
	                <Button
	                  variant="ghost"
	                  size="icon"
	                  className="h-7 w-7"
	                  onClick={(event) => {
	                    event.stopPropagation();
	                    onArchive(card.id);
	                  }}
	                  aria-label="Arquivar flashcard"
	                >
                  <Archive className="h-3.5 w-3.5" aria-hidden />
                </Button>
              )}
            </>
          ) : (
            onRestore && (
	              <Button
	                variant="ghost"
	                size="icon"
	                className="h-7 w-7"
	                onClick={(event) => {
	                  event.stopPropagation();
	                  onRestore(card.id);
	                }}
	                aria-label="Restaurar flashcard"
	              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden />
              </Button>
            )
          )}
          {onDelete && (
	            <Button
	              variant="ghost"
	              size="icon"
	              className="text-destructive hover:text-destructive h-7 w-7"
	              onClick={(event) => {
	                event.stopPropagation();
	                onDelete(card.id);
	              }}
	              aria-label="Excluir flashcard"
	            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden />
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
