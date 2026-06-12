"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ExternalLink, MoreHorizontal, Star } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCategoryVisual } from "@/lib/presentation/category-visuals";
import type { ResourceWithProgress } from "@/lib/domain/resources";
import { RESOURCE_STATUS_LABELS } from "@/lib/domain/resources";
import type { ResourceStatus } from "@/types/database";
import { ResourceTypeBadge, ResourceDifficultyBadge } from "./resource-badge";

interface ResourceCardProps {
  item: ResourceWithProgress;
  onToggleFavorite: (id: string) => Promise<void>;
  onUpdateStatus: (id: string, status: ResourceStatus) => Promise<void>;
  onOpenResource: (id: string) => Promise<void>;
  onArchive: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onMarkForReview: (id: string) => Promise<void>;
  onEdit: (id: string) => void;
}

const STATUS_OPTIONS: ResourceStatus[] = [
  "not_started",
  "in_progress",
  "completed",
  "saved_for_later",
];

export function ResourceCard({
  item,
  onToggleFavorite,
  onUpdateStatus,
  onOpenResource,
  onArchive,
  onDelete,
  onMarkForReview,
  onEdit,
}: ResourceCardProps) {
  const { resource, progress } = item;
  const categoryVisual = getCategoryVisual(resource.category);
  const [isBusy, setIsBusy] = useState(false);

  async function handleOpenLink() {
    if (resource.url) {
      window.open(resource.url, "_blank", "noopener,noreferrer");
      await onOpenResource(resource.id);
    }
  }

  async function withBusy(fn: () => Promise<void>) {
    if (isBusy) return;
    setIsBusy(true);
    try {
      await fn();
    } catch {
      toast.error("Erro ao atualizar recurso.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <Card className={`border-l-4 ${categoryVisual.border} transition-shadow hover:shadow-md`}>
      <CardHeader className="pb-2 pt-3 px-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              <span className={`text-xs font-medium ${categoryVisual.text}`}>
                {categoryVisual.label}
              </span>
              <ResourceTypeBadge type={resource.type} />
              <ResourceDifficultyBadge difficulty={resource.difficulty} />
            </div>
            <h3 className="font-medium text-sm leading-snug truncate" title={resource.title}>
              {resource.title}
            </h3>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              aria-label={resource.isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              className="text-muted-foreground hover:text-amber-500 transition-colors p-1 rounded"
              onClick={() => withBusy(() => onToggleFavorite(resource.id))}
            >
              <Star
                className="size-4"
                fill={resource.isFavorite ? "currentColor" : "none"}
                strokeWidth={1.5}
                style={{ color: resource.isFavorite ? "#f59e0b" : undefined }}
              />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger aria-label="Mais opções" className="inline-flex items-center justify-center size-7 rounded-md hover:bg-accent transition-colors">
                <MoreHorizontal className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(resource.id)}>Editar</DropdownMenuItem>
                <DropdownMenuItem onClick={() => withBusy(() => onMarkForReview(resource.id))}>
                  Marcar para revisão
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => withBusy(() => onArchive(resource.id))}>
                  Arquivar
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => withBusy(() => onDelete(resource.id))}
                >
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-3">
        {resource.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{resource.description}</p>
        )}

        <div className="flex items-center justify-between gap-2 mt-2">
          <div className="flex items-center gap-2">
            <Select
              value={progress?.status ?? "not_started"}
              onValueChange={(val) =>
                withBusy(() => onUpdateStatus(resource.id, val as ResourceStatus))
              }
            >
              <SelectTrigger className="h-7 text-xs w-36">
                <SelectValue>
                  {(v) => (v ? (RESOURCE_STATUS_LABELS[v as keyof typeof RESOURCE_STATUS_LABELS] ?? String(v)) : "Status")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s} className="text-xs">
                    {RESOURCE_STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {resource.estimatedMinutes && (
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                ~{resource.estimatedMinutes}min
              </span>
            )}
          </div>

          {resource.url && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={handleOpenLink}
            >
              <ExternalLink className="size-3" />
              Abrir
            </Button>
          )}
        </div>

        {resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {resource.tags.slice(0, 4).map((tag) => (
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
