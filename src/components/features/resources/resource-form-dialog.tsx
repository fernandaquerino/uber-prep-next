"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RESOURCE_TYPE_LABELS, RESOURCE_DIFFICULTY_LABELS } from "@/lib/domain/resources";
import type { CreateResourceInput } from "@/lib/domain/resources";
import { getCategoryLabel } from "@/lib/presentation/category-visuals";
import type { ResourceType, ResourceDifficulty } from "@/types/database";

const CATEGORIES = ["algo", "system", "js", "fe_coding", "mock", "behavioral"];
const TYPES: ResourceType[] = [
  "article",
  "video",
  "course",
  "documentation",
  "book",
  "exercise",
  "repo",
  "cheatsheet",
  "other",
];
const DIFFICULTIES: ResourceDifficulty[] = ["beginner", "intermediate", "advanced"];

interface ResourceFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateResourceInput) => Promise<void>;
  defaultValues?: Partial<CreateResourceInput>;
  title?: string;
}

export function ResourceFormDialog({
  open,
  onClose,
  onSubmit,
  defaultValues,
  title = "Novo recurso",
}: ResourceFormDialogProps) {
  const [formTitle, setFormTitle] = useState(defaultValues?.title ?? "");
  const [url, setUrl] = useState(defaultValues?.url ?? "");
  const [type, setType] = useState<ResourceType>(defaultValues?.type ?? "article");
  const [category, setCategory] = useState(defaultValues?.category ?? "algo");
  const [difficulty, setDifficulty] = useState<ResourceDifficulty | "">(
    defaultValues?.difficulty ?? "",
  );
  const [estimatedMinutes, setEstimatedMinutes] = useState<string>(
    defaultValues?.estimatedMinutes?.toString() ?? "",
  );
  const [tags, setTags] = useState(defaultValues?.tags?.join(", ") ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function reset() {
    setFormTitle(defaultValues?.title ?? "");
    setUrl(defaultValues?.url ?? "");
    setType(defaultValues?.type ?? "article");
    setCategory(defaultValues?.category ?? "algo");
    setDifficulty(defaultValues?.difficulty ?? "");
    setEstimatedMinutes(defaultValues?.estimatedMinutes?.toString() ?? "");
    setTags(defaultValues?.tags?.join(", ") ?? "");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formTitle.trim()) {
      setError("Título é obrigatório.");
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit({
        title: formTitle.trim(),
        url: url.trim() || undefined,
        type,
        category,
        difficulty: difficulty || undefined,
        estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes, 10) : undefined,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        topicIds: [],
        linkedPlanBlockIds: [],
      });
      reset();
      onClose();
    } catch {
      setError("Erro ao salvar recurso.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          reset();
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="res-title">Título *</Label>
            <Input
              id="res-title"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Nome do recurso"
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="res-url">URL</Label>
            <Input
              id="res-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Tipo *</Label>
              <Select value={type} onValueChange={(v) => setType(v as ResourceType)}>
                <SelectTrigger>
                  <SelectValue>
                    {(v) => (v ? (RESOURCE_TYPE_LABELS[v as keyof typeof RESOURCE_TYPE_LABELS] ?? String(v)) : "Selecionar")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {RESOURCE_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Categoria *</Label>
              <Select value={category} onValueChange={(v) => { if (v) setCategory(v); }}>
                <SelectTrigger>
                  <SelectValue>
                    {(v) => (v ? getCategoryLabel(String(v)) : "Selecionar")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {getCategoryLabel(c)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Dificuldade</Label>
              <Select
                value={difficulty || "_none"}
                onValueChange={(v) =>
                  setDifficulty(v === "_none" ? "" : (v as ResourceDifficulty))
                }
              >
                <SelectTrigger>
                  <SelectValue>
                    {(v) => (!v || v === "_none" ? "Opcional" : (RESOURCE_DIFFICULTY_LABELS[v as keyof typeof RESOURCE_DIFFICULTY_LABELS] ?? String(v)))}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">Não definida</SelectItem>
                  {DIFFICULTIES.map((d) => (
                    <SelectItem key={d} value={d}>
                      {RESOURCE_DIFFICULTY_LABELS[d]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="res-minutes">Duração estimada (min)</Label>
              <Input
                id="res-minutes"
                type="number"
                min={1}
                max={600}
                placeholder="Ex: 60"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="res-tags">Tags (separadas por vírgula)</Label>
            <Input
              id="res-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="leetcode, patterns, free"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onClose();
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
