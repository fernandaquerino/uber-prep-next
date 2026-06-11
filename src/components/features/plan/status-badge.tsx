import type { PlanBlockExecutionStatus } from "@/lib/domain/progress";
import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  status: PlanBlockExecutionStatus;
  isOverdue?: boolean;
  className?: string;
};

const STATUS_CLASSES: Record<PlanBlockExecutionStatus, string> = {
  pending: "bg-muted text-muted-foreground border-border",
  in_progress:
    "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700",
  completed:
    "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700",
  stuck:
    "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700",
  skipped: "bg-muted/60 text-muted-foreground border-border/60",
};

const STATUS_LABELS: Record<PlanBlockExecutionStatus, string> = {
  pending: "Pendente",
  in_progress: "Em andamento",
  completed: "Concluído",
  stuck: "Travado",
  skipped: "Pulado",
};

export function StatusBadge({ status, isOverdue = false, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium",
        STATUS_CLASSES[status],
        className,
      )}
    >
      {STATUS_LABELS[status]}
      {isOverdue && status !== "completed" && status !== "skipped" && (
        <span
          aria-label="(atrasado)"
          className="inline-block h-1.5 w-1.5 rounded-full bg-red-500"
        />
      )}
    </span>
  );
}

export function OverdueBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300",
        className,
      )}
    >
      Atrasado
    </span>
  );
}
