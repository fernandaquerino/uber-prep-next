"use client";

import { useState } from "react";
import type { ReviewQueueItemViewModel } from "@/lib/presentation/reviews/review-view-model";
import type { ReviewResult } from "@/types/database";
import type { CalendarDate } from "@/lib/domain/schedule";
import type { UseReviewActionsResult } from "@/hooks/use-review-actions";
import { ReviewQueueItem } from "./review-queue-item";
import { ReviewItemDialog } from "./review-item-dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Layers, Plus } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  queue: ReviewQueueItemViewModel[];
  actions: UseReviewActionsResult;
  onCompleted: (reviewId: string, result: ReviewResult, nextDate: CalendarDate | null) => void;
  onRequestManualReview: () => void;
};

export function ReviewQueueList({ queue, actions, onCompleted, onRequestManualReview }: Props) {
  const [openItem, setOpenItem] = useState<ReviewQueueItemViewModel | null>(null);

  function handleCompleted(result: ReviewResult, nextDate: CalendarDate | null) {
    if (openItem) {
      onCompleted(openItem.reviewId, result, nextDate);
    }
  }

  if (queue.length === 0) {
    return <EmptyQueue onRequestManual={onRequestManualReview} />;
  }

  return (
    <section aria-labelledby="review-queue-heading">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="review-queue-heading" className="text-sm font-semibold">
          Fila de revisões{" "}
          <span className="text-muted-foreground font-normal">({queue.length})</span>
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRequestManualReview}
          className="text-muted-foreground gap-1"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Adicionar revisão
        </Button>
      </div>

      <ul className="flex flex-col gap-2" role="list" aria-label="Revisões pendentes">
        {queue.map((item) => (
          <ReviewQueueItem key={item.reviewId} item={item} onOpen={setOpenItem} />
        ))}
      </ul>

      <ReviewItemDialog
        item={openItem}
        open={openItem !== null}
        onClose={() => setOpenItem(null)}
        onCompleted={handleCompleted}
        actions={actions}
      />
    </section>
  );
}

function EmptyQueue({ onRequestManual }: { onRequestManual: () => void }) {
  return (
    <section
      className="bg-card flex min-h-[260px] flex-col justify-between rounded-lg border p-5"
      aria-labelledby="empty-review-heading"
    >
      <div className="flex flex-col gap-4">
        <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-5 w-5" aria-hidden />
        </div>

        <div>
          <h2 id="empty-review-heading" className="text-lg font-semibold">
            Tudo em dia por aqui
          </h2>
          <p className="text-muted-foreground mt-1 max-w-xl text-sm">
            Nenhuma revisão está vencida para hoje. Quando você marcar um conteúdo para revisar,
            errar um flashcard ou criar uma revisão manual, ele aparece nesta fila.
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-lg border bg-muted/25 p-3">
            <p className="text-sm font-medium">Quer revisar algo agora?</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Crie uma revisão manual para um tópico que ainda está fresco ou difícil.
            </p>
          </div>
          <div className="rounded-lg border bg-muted/25 p-3">
            <p className="text-sm font-medium">Próximas revisões ficam salvas</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Itens agendados para outros dias aparecem no resumo como próximas.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={onRequestManual}>
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Adicionar revisão manual
        </Button>
        <Link href="/flashcards" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
          <Layers className="h-3.5 w-3.5" aria-hidden />
          Estudar flashcards
        </Link>
        <Link href="/plano" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
          Ver plano
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
