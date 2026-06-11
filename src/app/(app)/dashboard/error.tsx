"use client";

import { useEffect } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("[/dashboard] Error:", error);
    }
  }, [error]);

  return (
    <PageContainer>
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <h2 className="text-lg font-semibold">Não foi possível carregar o dashboard</h2>
        <p className="text-muted-foreground max-w-sm text-sm">
          Ocorreu um erro inesperado. Verifique se o IndexedDB está disponível no seu navegador.
          {process.env.NODE_ENV === "development" && (
            <span className="mt-1 block font-mono text-xs opacity-70">{error.message}</span>
          )}
        </p>
        <Button onClick={reset} variant="outline">
          Tentar novamente
        </Button>
      </div>
    </PageContainer>
  );
}
