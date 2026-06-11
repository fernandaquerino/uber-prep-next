"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getDb } from "@/lib/db/db";
import { createPlaygroundRepository } from "@/lib/repositories/playground.repository";
import type { PlaygroundSolutionRecord } from "@/types/database";
import { createSolutionId, parseStoredSolutionNotes } from "./playground-storage";

type PlaygroundSavedProps = {
  onLoad: (solution: PlaygroundSolutionRecord) => void;
};

export default function PlaygroundSaved({ onLoad }: PlaygroundSavedProps) {
  const [solutions, setSolutions] = useState<PlaygroundSolutionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  async function loadSolutions(active = true) {
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

  useEffect(() => {
    let active = true;

    queueMicrotask(() => {
      void loadSolutions(active);
    });

    return () => {
      active = false;
    };
  }, []);

  async function deleteSolution(id: string) {
    const repository = createPlaygroundRepository(getDb());
    await repository.delete(id);
    await loadSolutions();
  }

  async function duplicateSolution(solution: PlaygroundSolutionRecord) {
    const repository = createPlaygroundRepository(getDb());
    const now = new Date().toISOString();

    await repository.upsert({
      ...solution,
      id: createSolutionId(),
      title: `${solution.title ?? "Solução"} (cópia)`,
      createdAt: now,
      updatedAt: now,
    });
    await loadSolutions();
  }

  const normalizedQuery = query.trim().toLowerCase();
  const filteredSolutions = solutions.filter((solution) => {
    if (!normalizedQuery) return true;

    return [solution.title, solution.category, solution.language, solution.notes]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(normalizedQuery));
  });

  if (loading) {
    return <p className="text-muted-foreground text-sm">Carregando soluções salvas...</p>;
  }

  if (error) {
    return <p className="text-destructive text-sm">{error}</p>;
  }

  return (
    <div className="grid gap-3">
      <label className="grid gap-1 text-sm">
        <span className="text-muted-foreground">Buscar soluções</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="border-border rounded-lg border px-3 py-2 text-sm"
          placeholder="Nome, tópico ou anotação"
        />
      </label>

      {filteredSolutions.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nenhuma solução salva encontrada.</p>
      ) : (
        <div className="grid gap-2.5">
          {filteredSolutions.map((solution) => {
            const metadata = parseStoredSolutionNotes(solution.notes);

            return (
              <article key={solution.id} className="border-border rounded-lg border p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold">{solution.title ?? "Sem título"}</p>
                    <p className="text-muted-foreground text-xs">
                      {solution.category ?? "Sem tópico"} ·{" "}
                      {new Date(solution.updatedAt).toLocaleString("pt-BR")}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {metadata.status ?? "draft"}
                      {metadata.testPassRate !== undefined && metadata.testPassRate !== null
                        ? ` · ${metadata.testPassRate}% testes`
                        : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" size="sm" onClick={() => onLoad(solution)}>
                      Abrir
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void duplicateSolution(solution)}
                    >
                      Duplicar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => void deleteSolution(solution.id)}
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
