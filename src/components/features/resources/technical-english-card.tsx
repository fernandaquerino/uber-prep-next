"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Copy, Star } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TECH_ENGLISH_SCENARIO_LABELS,
  TECH_ENGLISH_TYPE_LABELS,
} from "@/lib/domain/technical-english";
import type { TechnicalEnglishRecord } from "@/types/database";

interface TechnicalEnglishCardProps {
  item: TechnicalEnglishRecord;
  isPracticed: boolean;
  onToggleFavorite: (id: string) => Promise<void>;
  onPractice: (id: string) => void;
  onMarkForReview: (id: string) => Promise<void>;
}

export function TechnicalEnglishCard({
  item,
  isPracticed,
  onToggleFavorite,
  onPractice,
  onMarkForReview,
}: TechnicalEnglishCardProps) {
  const [expanded, setExpanded] = useState(false);

  async function copyContent() {
    try {
      await navigator.clipboard.writeText(item.content);
      toast.success("Copiado!");
    } catch {
      toast.error("Não foi possível copiar.");
    }
  }

  return (
    <Card className="border transition-shadow hover:shadow-sm">
      <CardHeader className="pb-2 pt-3 px-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              <Badge variant="outline" className="text-xs">
                {TECH_ENGLISH_SCENARIO_LABELS[item.scenario]}
              </Badge>
              <Badge variant="outline" className="text-xs bg-muted">
                {TECH_ENGLISH_TYPE_LABELS[item.type]}
              </Badge>
              {isPracticed && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400">✓ Praticado</span>
              )}
            </div>
            <h3 className="font-medium text-sm leading-snug">{item.title}</h3>
          </div>

          <button
            aria-label={item.isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            onClick={() => onToggleFavorite(item.id)}
            className="text-muted-foreground hover:text-amber-500 transition-colors p-1 shrink-0"
          >
            <Star
              className="size-4"
              fill={item.isFavorite ? "currentColor" : "none"}
              strokeWidth={1.5}
              style={{ color: item.isFavorite ? "#f59e0b" : undefined }}
            />
          </button>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-3">
        <div className="bg-muted/50 rounded p-2.5 text-sm font-medium text-foreground whitespace-pre-line">
          {item.content}
        </div>

        {item.translation && expanded && (
          <div className="mt-2 bg-muted/30 rounded p-2.5 text-sm text-muted-foreground whitespace-pre-line">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">
              Tradução
            </span>
            {item.translation}
          </div>
        )}

        <div className="flex items-center justify-between gap-2 mt-2">
          <div className="flex gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => setExpanded((e) => !e)}
              aria-label={expanded ? "Ocultar tradução" : "Ver tradução"}
            >
              {expanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
              {expanded ? "Menos" : "Tradução"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={copyContent}
            >
              <Copy className="size-3" />
              Copiar
            </Button>
          </div>
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => onPractice(item.id)}
            >
              Praticar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => onMarkForReview(item.id)}
            >
              Revisão
            </Button>
          </div>
        </div>

        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {item.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
