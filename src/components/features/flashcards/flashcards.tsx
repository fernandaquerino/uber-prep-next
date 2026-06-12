"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Download, FileUp, Plus, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { FlashcardCard } from "@/components/features/flashcards/flashcard-card";
import { FlashcardFiltersBar } from "@/components/features/flashcards/flashcard-filters-bar";
import { FlashcardSummaryCards } from "@/components/features/flashcards/flashcard-summary-cards";
import { useFlashcardActions } from "@/hooks/use-flashcard-actions";
import { useFlashcardStudySession } from "@/hooks/use-flashcard-study-session";
import { useFlashcards } from "@/hooks/use-flashcards";
import {
  applyFlashcardFilters,
  findPotentialDuplicateFlashcards,
  normalizeTags,
} from "@/lib/domain/flashcards";
import type { FlashcardFilters, FlashcardListItem } from "@/lib/domain/flashcards";
import { parseCalendarDate } from "@/lib/domain/schedule";
import {
  buildFlashcardSummaryViewModel,
  buildFlashcardViewModel,
  buildSessionSummaryViewModel,
} from "@/lib/presentation/flashcards/build-flashcard-view-model";
import { renderMarkdown } from "@/lib/utils/markdown";
import type { FlashcardRecord, ReviewResult } from "@/types/database";

const CATEGORY_OPTIONS = [
  { value: "algo", label: "Algoritmos" },
  { value: "js", label: "JavaScript" },
  { value: "react", label: "React" },
  { value: "fe_coding", label: "Frontend Coding" },
  { value: "system", label: "System Design" },
  { value: "behavioral", label: "Behavioral" },
  { value: "english", label: "Inglês técnico" },
  { value: "mock", label: "Mocks" },
  { value: "general", label: "Geral" },
];

const EMPTY_FORM = {
  front: "",
  back: "",
  category: "js",
  tags: "",
};

type FlashcardFormState = typeof EMPTY_FORM;
type SummaryFilter = "due" | "new" | "learning" | "reviewing" | "mastered" | "archived";

function getTodayCalendarDate() {
  const now = new Date();
  return parseCalendarDate(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`,
  );
}

function toRecord(item: FlashcardListItem): FlashcardRecord {
  return {
    id: item.id,
    front: item.front,
    back: item.back,
    category: item.category,
    tags: item.tags,
    status: "pending",
    lifecycleStatus: item.lifecycleStatus,
    source: item.source,
    ...(item.sourceId ? { sourceId: item.sourceId } : {}),
    nextReview: item.nextReviewDate,
    knownAt: null,
    lastReviewedAt: null,
    reviewCount: item.reviewCount,
    reviews: [],
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function formFromCard(card: FlashcardListItem): FlashcardFormState {
  return {
    front: card.front,
    back: card.back,
    category: card.category,
    tags: card.tags.join(", "),
  };
}

async function getDb() {
  const { getDb: loadDb } = await import("@/lib/db/db");
  return loadDb();
}

export default function FlashCards() {
  const { data, isLoading, isRefreshing, error, refresh } = useFlashcards();
  const actions = useFlashcardActions(refresh);
  const studySession = useFlashcardStudySession(actions.answerFlashcard);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [filters, setFilters] = useState<FlashcardFilters>({
    sortField: "createdAt",
    sortDirection: "desc",
  });
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FlashcardFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [importReport, setImportReport] = useState<string | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedCardRevealed, setSelectedCardRevealed] = useState(false);

  useEffect(() => {
    studySession.restoreSession();
    // Restore only once on page mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const today = useMemo(() => getTodayCalendarDate(), []);

  const filteredCards = useMemo(() => {
    if (!data) return [];
    return applyFlashcardFilters(data.allCards, filters);
  }, [data, filters]);

  const visibleCards = useMemo(
    () => filteredCards.map((card) => buildFlashcardViewModel(card, today)),
    [filteredCards, today],
  );

  const summary = useMemo(
    () => buildFlashcardSummaryViewModel(data?.allCards ?? []),
    [data?.allCards],
  );

  const currentStudyCard = studySession.session?.cards[studySession.session.currentIndex];
  const studyProgress =
    studySession.session && studySession.session.cards.length > 0
      ? `${Math.min(studySession.session.currentIndex + 1, studySession.session.cards.length)} / ${studySession.session.cards.length}`
      : "0 / 0";
  const sessionSummary = studySession.result
    ? buildSessionSummaryViewModel(studySession.result)
    : null;
  const selectedCard = visibleCards.find((card) => card.id === selectedCardId) ?? null;

  function updateFilters(next: Partial<FlashcardFilters>) {
    setFilters((current) => ({ ...current, ...next }));
  }

  function resetFilters() {
    setFilters({ sortField: "createdAt", sortDirection: "desc" });
  }

  function getActiveSummaryFilter(): SummaryFilter | undefined {
    if (filters.lifecycleStatus === "archived") return "archived";
    if (filters.isDue) return "due";
    if (
      filters.learningState === "new" ||
      filters.learningState === "learning" ||
      filters.learningState === "reviewing" ||
      filters.learningState === "mastered"
    ) {
      return filters.learningState;
    }
    return undefined;
  }

  function selectSummaryFilter(filter: SummaryFilter) {
    const isActive = getActiveSummaryFilter() === filter;
    if (isActive) {
      resetFilters();
      return;
    }

    if (filter === "archived") {
      setFilters({
        sortField: "updatedAt",
        sortDirection: "desc",
        lifecycleStatus: "archived",
        includeArchived: true,
      });
      return;
    }

    if (filter === "due") {
      setFilters({
        sortField: "nextReview",
        sortDirection: "asc",
        isDue: true,
      });
      return;
    }

    setFilters({
      sortField: "createdAt",
      sortDirection: "desc",
      learningState: filter,
    });
  }

  function openCreateForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setFormOpen(true);
  }

  function openEditForm(id: string) {
    const card = data?.allCards.find((item) => item.id === id);
    if (!card) return;
    setSelectedCardId(null);
    setEditingId(id);
    setForm(formFromCard(card));
    setFormError(null);
    setFormOpen(true);
  }

  function openStudyCard(id: string) {
    setSelectedCardId(id);
    setSelectedCardRevealed(false);
  }

  async function markSelectedCard(result: ReviewResult) {
    if (!selectedCard) return;
    await actions.answerFlashcard(selectedCard.id, result, true);
    setSelectedCardId(null);
    setSelectedCardRevealed(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!data) return;

    const front = form.front.trim();
    const back = form.back.trim();
    const category = form.category.trim();
    const tags = normalizeTags(form.tags.split(","));

    if (!front || !back || !category) {
      setFormError("Preencha frente, verso e categoria.");
      return;
    }

    const duplicateResult = findPotentialDuplicateFlashcards(
      front,
      back,
      category,
      data.allCards.map(toRecord),
      editingId ?? undefined,
    );

    if (duplicateResult.exactDuplicates.length > 0) {
      setFormError("Já existe um flashcard ativo com a mesma frente, resposta e categoria.");
      return;
    }

    if (
      duplicateResult.potentialDuplicates.length > 0 &&
      !window.confirm("Existe um flashcard parecido. Quer salvar mesmo assim?")
    ) {
      return;
    }

    if (editingId) {
      await actions.updateFlashcard({ id: editingId, front, back, category, tags });
    } else {
      await actions.createFlashcard({ front, back, category, tags });
    }

    setFormOpen(false);
  }

  function handleArchive(id: string) {
    void actions.archiveFlashcard(id);
  }

  function handleRestore(id: string) {
    void actions.restoreFlashcard(id);
  }

  function handleDelete(id: string) {
    const card = data?.allCards.find((item) => item.id === id);
    const label = card?.front.slice(0, 80) ?? "este flashcard";
    if (!window.confirm(`Excluir "${label}"? Esta ação também cancela revisões futuras.`)) {
      return;
    }
    void actions.deleteFlashcard(id);
  }

  function startDueSession() {
    if (!data) return;
    studySession.startSession(
      { type: "due", limit: 20, shuffle: true, updateSpacedRep: true },
      data,
    );
  }

  function startNewSession() {
    if (!data) return;
    studySession.startSession(
      { type: "new", limit: 10, shuffle: true, updateSpacedRep: true },
      data,
    );
  }

  function startFilteredPractice() {
    if (!data) return;
    studySession.startSession(
      {
        type: "filtered",
        limit: 30,
        shuffle: true,
        updateSpacedRep: false,
        cardIds: filteredCards.map((card) => card.id),
      },
      data,
    );
  }

  async function handleExport() {
    const db = await getDb();
    const { exportFlashcards } = await import("@/lib/application/flashcards");
    const exported = await exportFlashcards(db);
    const blob = new Blob([JSON.stringify(exported, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `uber-prep-flashcards-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const db = await getDb();
      const { importFlashcards } = await import("@/lib/application/flashcards");
      const parsed = JSON.parse(await file.text()) as unknown;
      const result = await importFlashcards(db, parsed);
      setImportReport(
        `Importados: ${result.imported}. Ignorados: ${result.skipped}. Erros: ${result.errors.length}.`,
      );
      refresh();
    } catch (err) {
      setImportReport(err instanceof Error ? err.message : "Não foi possível importar o arquivo.");
    } finally {
      event.target.value = "";
    }
  }

  function answerCurrent(result: ReviewResult) {
    if (!currentStudyCard) return;
    studySession.answer(currentStudyCard.flashcardId, result);
  }

  if (isLoading) {
    return <FlashcardsSkeleton />;
  }

  if (error) {
    return (
      <div className="border-destructive/30 bg-destructive/10 rounded-lg border p-4">
        <p className="text-destructive text-sm font-medium">Erro ao carregar flashcards</p>
        <p className="text-muted-foreground mt-1 text-sm">{error}</p>
        <Button className="mt-3" variant="outline" onClick={refresh}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <Button onClick={startDueSession} disabled={!data?.dueCount || actions.isLoading}>
              Revisar vencidos
            </Button>
            <Button
              variant="outline"
              onClick={startNewSession}
              disabled={!data?.newCount || actions.isLoading}
            >
              Estudar novos
            </Button>
            <Button
              variant="outline"
              onClick={startFilteredPractice}
              disabled={filteredCards.length === 0}
            >
              Praticar filtrados
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4" aria-hidden />
              Exportar
            </Button>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <FileUp className="h-4 w-4" aria-hidden />
              Importar
            </Button>
            <Button onClick={openCreateForm}>
              <Plus className="h-4 w-4" aria-hidden />
              Novo flashcard
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={handleImport}
              aria-label="Importar flashcards"
            />
          </div>
        </div>

        {importReport && (
          <p className="bg-muted/40 text-muted-foreground rounded-md border px-3 py-2 text-sm">
            {importReport}
          </p>
        )}

        {actions.error && (
          <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
            {actions.error}
          </p>
        )}

        {isRefreshing && <p className="text-muted-foreground text-xs">Atualizando flashcards…</p>}
      </section>

      <FlashcardSummaryCards
        summary={summary}
        activeFilter={getActiveSummaryFilter()}
        onSelect={selectSummaryFilter}
      />

      <section className="rounded-lg border p-3">
        <FlashcardFiltersBar
          filters={filters}
          onFiltersChange={updateFilters}
          onReset={resetFilters}
          allTags={data?.allTags ?? []}
        />
      </section>

      {sessionSummary && (
        <section className="bg-muted/30 rounded-lg border p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium">Sessão finalizada</p>
              <p className="text-muted-foreground text-sm">
                {sessionSummary.total} respostas em {sessionSummary.durationFormatted}. Acertos
                bons/fáceis: {sessionSummary.goodPlusEasyPercent}%.
              </p>
            </div>
            <Badge variant="outline">{sessionSummary.againPercent}% para revisar de novo</Badge>
          </div>
        </section>
      )}

      {studySession.session && (
        <section className="rounded-lg border p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium">Sessão de flashcards</p>
              <p className="text-muted-foreground text-sm">{studyProgress}</p>
            </div>
            <div className="flex gap-2">
              {!currentStudyCard && (
                <Button onClick={studySession.endSession}>Finalizar sessão</Button>
              )}
              <Button variant="ghost" size="sm" onClick={studySession.cancelSession}>
                <X className="h-4 w-4" aria-hidden />
                Encerrar
              </Button>
            </div>
          </div>

          {currentStudyCard ? (
            <div className="grid gap-4">
              <div className="bg-background rounded-lg border p-4">
                <div className="mb-3 flex flex-wrap gap-2">
                  <Badge variant="outline">{currentStudyCard.category}</Badge>
                  {currentStudyCard.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      #{tag}
                    </Badge>
                  ))}
                </div>
                <div
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(currentStudyCard.front) }}
                />
              </div>

              {studySession.session.isRevealed ? (
                <div className="grid gap-3">
                  <div className="bg-muted/30 rounded-lg border p-4">
                    <div
                      className="prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(currentStudyCard.back) }}
                    />
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    <Button variant="outline" onClick={() => answerCurrent("again")}>
                      Ainda preciso revisar
                    </Button>
                    <Button onClick={() => answerCurrent("good")}>Já sei</Button>
                  </div>
                </div>
              ) : (
                <Button onClick={studySession.reveal}>Virar cartão</Button>
              )}
            </div>
          ) : (
            <div className="text-muted-foreground rounded-lg border border-dashed p-4 text-sm">
              Nenhum cartão disponível nesta sessão.
            </div>
          )}
        </section>
      )}

      {visibleCards.length > 0 ? (
        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visibleCards.map((card) => (
            <FlashcardCard
              key={card.id}
              card={card}
              onOpen={openStudyCard}
              onEdit={openEditForm}
              onArchive={handleArchive}
              onRestore={handleRestore}
              onDelete={handleDelete}
            />
          ))}
        </section>
      ) : (
        <section className="rounded-lg border border-dashed p-6 text-center">
          <p className="text-sm font-medium">Nenhum flashcard encontrado</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Ajuste os filtros ou crie um novo cartão para continuar estudando.
          </p>
          <Button className="mt-3" onClick={openCreateForm}>
            <Plus className="h-4 w-4" aria-hidden />
            Novo flashcard
          </Button>
        </section>
      )}

      <Dialog
        open={selectedCard !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedCardId(null);
            setSelectedCardRevealed(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl" aria-describedby="flashcard-detail-description">
          {selectedCard && (
            <div className="grid gap-4">
              <DialogHeader>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className={selectedCard.categoryBadge}>
                    {selectedCard.categoryLabel}
                  </Badge>
                  <Badge variant="outline" className={selectedCard.learningStateBadge}>
                    {selectedCard.learningStateLabel}
                  </Badge>
                  {selectedCard.nextReviewDate && (
                    <Badge variant="outline">Revisão: {selectedCard.nextReviewFormatted}</Badge>
                  )}
                </div>
                <DialogTitle>Flashcard</DialogTitle>
                <DialogDescription id="flashcard-detail-description">
                  Revele a resposta antes de marcar seu resultado.
                </DialogDescription>
              </DialogHeader>

              <section className="grid gap-2">
                <h3 className="text-sm font-medium">Pergunta</h3>
                <div
                  className="prose prose-sm bg-background dark:prose-invert max-w-none rounded-lg border p-4"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(selectedCard.front) }}
                />
              </section>

              {selectedCardRevealed ? (
                <section className="grid gap-2">
                  <h3 className="text-sm font-medium">Resposta</h3>
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(selectedCard.back) }}
                  />
                </section>
              ) : (
                <Button
                  type="button"
                  className="mx-auto min-w-48"
                  variant="outline"
                  onClick={() => setSelectedCardRevealed(true)}
                >
                  Revelar resposta
                </Button>
              )}

              {selectedCard.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedCard.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              <DialogFooter showCloseButton={false}>
                <Button type="button" variant="outline" onClick={() => setSelectedCardId(null)}>
                  Fechar
                </Button>
                {selectedCardRevealed ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => void markSelectedCard("again")}
                      disabled={actions.isLoading}
                    >
                      Ainda preciso revisar
                    </Button>
                    <Button
                      type="button"
                      onClick={() => void markSelectedCard("good")}
                      disabled={actions.isLoading}
                    >
                      Já sei
                    </Button>
                  </>
                ) : selectedCard.lifecycleStatus === "active" ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleArchive(selectedCard.id)}
                    >
                      Arquivar
                    </Button>
                    <Button type="button" onClick={() => openEditForm(selectedCard.id)}>
                      Editar
                    </Button>
                  </>
                ) : (
                  <Button type="button" onClick={() => handleRestore(selectedCard.id)}>
                    Restaurar
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={formOpen} onOpenChange={(open) => !open && setFormOpen(false)}>
        <DialogContent className="sm:max-w-2xl" aria-describedby="flashcard-form-description">
          <form onSubmit={handleSubmit} className="grid gap-4">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar flashcard" : "Novo flashcard"}</DialogTitle>
              <DialogDescription id="flashcard-form-description">
                Escreva frente e verso em Markdown. HTML bruto é removido na renderização.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-2">
              <Label htmlFor="flashcard-front">Frente</Label>
              <Textarea
                id="flashcard-front"
                value={form.front}
                onChange={(event) =>
                  setForm((current) => ({ ...current, front: event.target.value }))
                }
                rows={4}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="flashcard-back">Verso</Label>
              <Textarea
                id="flashcard-back"
                value={form.back}
                onChange={(event) =>
                  setForm((current) => ({ ...current, back: event.target.value }))
                }
                rows={5}
                required
              />
            </div>

            <div className="grid gap-3 md:grid-cols-[220px_1fr]">
              <div className="grid gap-2">
                <Label>Categoria</Label>
                <Select
                  value={form.category}
                  onValueChange={(value) => {
                    if (!value) return;
                    setForm((current) => ({ ...current, category: value }));
                  }}
                >
                  <SelectTrigger aria-label="Categoria do flashcard">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="flashcard-tags">Tags</Label>
                <Input
                  id="flashcard-tags"
                  value={form.tags}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, tags: event.target.value }))
                  }
                  placeholder="closures, hooks, performance"
                />
              </div>
            </div>

            {formError && <p className="text-destructive text-sm">{formError}</p>}

            <DialogFooter showCloseButton={false}>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={actions.isLoading}>
                {actions.isLoading ? "Salvando…" : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FlashcardsSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap justify-between gap-2">
        <Skeleton className="h-8 w-80" />
        <Skeleton className="h-8 w-64" />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-20" />
        ))}
      </div>
      <Skeleton className="h-24" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-44" />
        ))}
      </div>
    </div>
  );
}
