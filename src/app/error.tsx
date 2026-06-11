"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <AlertCircle className="text-destructive h-10 w-10" aria-hidden="true" />
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Algo deu errado</h2>
        <p className="text-muted-foreground text-sm">
          Ocorreu um erro inesperado. Tente novamente ou recarregue a página.
        </p>
      </div>
      <Button onClick={reset} variant="outline" size="sm">
        Tentar novamente
      </Button>
    </div>
  );
}
