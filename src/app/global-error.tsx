"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center font-sans antialiased">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Erro crítico</h1>
          <p className="text-muted-foreground text-sm">
            O aplicativo encontrou um erro crítico. Por favor, recarregue a página.
          </p>
        </div>
        <Button onClick={reset} variant="outline">
          Recarregar
        </Button>
      </body>
    </html>
  );
}
