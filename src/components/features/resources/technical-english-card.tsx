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
      <CardHeader className="px-4 pt-3 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-1.5">
              <Badge variant="outline" className="text-xs">
                {TECH_ENGLISH_SCENARIO_LABELS[item.scenario]}
              </Badge>
              <Badge variant="outline" className="bg-muted text-xs">
                {TECH_ENGLISH_TYPE_LABELS[item.type]}
              </Badge>
              {isPracticed && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400">✓ Praticado</span>
              )}
            </div>
            <h3 className="text-sm leading-snug font-medium">{item.title}</h3>
          </div>

          <button
            aria-label={item.isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            onClick={() => onToggleFavorite(item.id)}
            className="text-muted-foreground shrink-0 p-1 transition-colors hover:text-amber-500"
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
        <div className="bg-muted/50 text-foreground rounded p-2.5 text-sm font-medium whitespace-pre-line">
          {item.content}
        </div>

        {item.translation && expanded && (
          <div className="bg-muted/30 text-muted-foreground mt-2 rounded p-2.5 text-sm whitespace-pre-line">
            <span className="text-muted-foreground mb-1 block text-xs font-medium tracking-wide uppercase">
              Tradução
            </span>
            {item.translation}
          </div>
        )}

        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => setExpanded((e) => !e)}
              aria-label={expanded ? "Ocultar tradução" : "Ver tradução"}
            >
              {expanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
              {expanded ? "Menos" : "Tradução"}
            </Button>
            <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={copyContent}>
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
          <div className="mt-2 flex flex-wrap gap-1">
            {item.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="bg-muted text-muted-foreground inline-flex items-center rounded px-1.5 py-0.5 text-[10px]"
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
