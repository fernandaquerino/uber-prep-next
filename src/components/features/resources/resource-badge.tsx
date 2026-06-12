"use client";

import { Badge } from "@/components/ui/badge";
import type { ResourceType, ResourceStatus, ResourceDifficulty } from "@/types/database";
import {
  RESOURCE_TYPE_LABELS,
  RESOURCE_STATUS_LABELS,
  RESOURCE_DIFFICULTY_LABELS,
} from "@/lib/domain/resources";

export function ResourceTypeBadge({ type }: { type: ResourceType }) {
  const iconMap: Record<ResourceType, string> = {
    article: "📄",
    video: "▶️",
    course: "🎓",
    documentation: "📚",
    book: "📖",
    exercise: "💻",
    repo: "🔗",
    cheatsheet: "📋",
    other: "📌",
  };
  return (
    <Badge variant="outline" className="text-xs gap-1">
      <span>{iconMap[type]}</span>
      {RESOURCE_TYPE_LABELS[type]}
    </Badge>
  );
}

export function ResourceStatusBadge({ status }: { status?: ResourceStatus }) {
  const effective = status ?? "not_started";
  const classMap: Record<ResourceStatus, string> = {
    not_started: "bg-muted text-muted-foreground border-border",
    in_progress: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700",
    completed: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700",
    saved_for_later: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700",
    archived: "bg-muted text-muted-foreground border-border",
  };
  return (
    <Badge variant="outline" className={`text-xs ${classMap[effective]}`}>
      {RESOURCE_STATUS_LABELS[effective]}
    </Badge>
  );
}

export function ResourceDifficultyBadge({ difficulty }: { difficulty?: ResourceDifficulty }) {
  if (!difficulty) return null;
  const classMap: Record<ResourceDifficulty, string> = {
    beginner: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300",
    intermediate: "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300",
    advanced: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300",
  };
  return (
    <Badge variant="outline" className={`text-xs ${classMap[difficulty]}`}>
      {RESOURCE_DIFFICULTY_LABELS[difficulty]}
    </Badge>
  );
}
