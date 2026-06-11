"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getDb } from "@/lib/db/db";
import { createPlaygroundRepository } from "@/lib/repositories/playground.repository";
import type { PlaygroundSolutionRecord } from "@/types/database";

type PlaygroundSavedProps = {
  onLoad: (solution: PlaygroundSolutionRecord) => void;
};

export default function PlaygroundSaved({ onLoad }: PlaygroundSavedProps) {
  const [solutions, setSolutions] = useState<PlaygroundSolutionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadSolutions() {
      try {
        setLoading(true);
        const repository = createPlaygroundRepository(getDb());
        const records = await repository.list();

        if (active) {
          setSolutions(records);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Não foi possível carregar soluções.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadSolutions();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <p className="text-muted-foreground text-sm">Carregando soluções salvas...</p>;
  }

  if (error) {
    return <p className="text-destructive text-sm">{error}</p>;
  }

  if (solutions.length === 0) {
    return <p className="text-muted-foreground text-sm">Nenhuma solução salva ainda.</p>;
  }

  return (
    <div className="grid gap-2.5">
      {solutions.map((solution) => (
        <article key={solution.id} className="border-border rounded-lg border p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold">{solution.title ?? "Sem título"}</p>
              <p className="text-muted-foreground text-xs">
                {solution.category ?? "Sem tópico"} ·{" "}
                {new Date(solution.updatedAt).toLocaleString("pt-BR")}
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => onLoad(solution)}>
              Abrir
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}
