"use client";

import type { MigrationStatus } from "@/types/database";

type Props = {
  status: MigrationStatus | null;
};

const STATUS_LABELS: Record<MigrationStatus, string> = {
  none: "Não iniciada",
  completed: "Concluída",
  partial: "Parcial",
  failed: "Falhou",
};

const STATUS_CLASSES: Record<MigrationStatus, string> = {
  none: "text-muted-foreground",
  completed: "text-green-600",
  partial: "text-amber-600",
  failed: "text-destructive",
};

export function MigrationStatusBadge({ status }: Props) {
  if (!status) return null;

  return (
    <span className={`text-xs font-medium ${STATUS_CLASSES[status]}`}>
      Migração: {STATUS_LABELS[status]}
    </span>
  );
}
