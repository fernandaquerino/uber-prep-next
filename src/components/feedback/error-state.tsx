"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ErrorStateProps = {
  title?: string;
  description?: string;
  retryAction?: React.ReactNode;
  onRetry?: () => void;
  className?: string;
};

export function ErrorState({
  title = "Algo deu errado",
  description = "Tente novamente. Se o problema persistir, recarregue a página.",
  retryAction,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "border-destructive/20 bg-destructive/5 flex flex-col items-center justify-center gap-4 rounded-lg border px-6 py-16 text-center",
        className,
      )}
      role="alert"
    >
      <AlertCircle className="text-destructive h-8 w-8" aria-hidden="true" />
      <div className="space-y-1">
        <p className="text-foreground text-sm font-medium">{title}</p>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      {retryAction ??
        (onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Tentar novamente
          </Button>
        ))}
    </div>
  );
}
