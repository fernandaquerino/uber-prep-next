"use client";

import { useState } from "react";
import type { ReviewQueueItemViewModel } from "@/lib/presentation/reviews/review-view-model";
import type { ReviewResult } from "@/types/database";
import type { CalendarDate } from "@/lib/domain/schedule";
import type { UseReviewActionsResult } from "@/hooks/use-review-actions";
import { ReviewQueueItem } from "./review-queue-item";
import { ReviewItemDialog } from "./review-item-dialog";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus } from "lucide-react";

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
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <BookOpen className="text-muted-foreground h-8 w-8" aria-hidden />
      <div>
        <p className="text-sm font-medium">Nenhuma revisão pendente para hoje.</p>
        <p className="text-muted-foreground mt-1 text-sm">
          Conclua ou marque conteúdos no Plano para criar sua fila.
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={onRequestManual} className="mt-1">
        <Plus className="mr-1.5 h-3.5 w-3.5" aria-hidden />
        Adicionar revisão manual
      </Button>
    </div>
  );
}
