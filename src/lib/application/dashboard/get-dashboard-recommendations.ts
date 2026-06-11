import type { CurrentStudyState, PlanCompletionSummary } from "@/lib/domain/progress";
import type { DashboardRecommendation } from "@/lib/presentation/dashboard/dashboard-view-model";

type RecommendationInput = {
  currentStudyState: CurrentStudyState;
  completionSummary: PlanCompletionSummary;
};

export function getDashboardRecommendations({
  currentStudyState,
  completionSummary,
}: RecommendationInput): DashboardRecommendation[] {
  const recommendations: DashboardRecommendation[] = [];

  const { currentItem, overdueItems, pendingItems, isPlanCompleted } = currentStudyState;
  const { stuck, inProgress } = completionSummary;

  if (isPlanCompleted) {
    recommendations.push({
      id: "plan_complete",
      title: "Plano concluído",
      description: "Você concluiu todos os blocos do plano. Revise os tópicos marcados para revisão.",
      priority: "low",
      action: { label: "Ver revisões", href: "/revisar" },
    });
    return recommendations;
  }

  // High priority: overdue items
  if (overdueItems.length > 0) {
    recommendations.push({
      id: "overdue_items",
      title: `${overdueItems.length} ${overdueItems.length === 1 ? "bloco atrasado" : "blocos atrasados"}`,
      description:
        overdueItems.length === 1
          ? `"${overdueItems[0].title}" está atrasado. Conclua ou reagende.`
          : `Você tem ${overdueItems.length} blocos atrasados que precisam de atenção.`,
      priority: "high",
      action: { label: "Ver plano", href: "/plano" },
    });
  }

  // High priority: stuck items
  if (stuck > 0) {
    recommendations.push({
      id: "stuck_items",
      title: `${stuck} ${stuck === 1 ? "bloco travado" : "blocos travados"}`,
      description:
        stuck === 1
          ? "Você marcou um bloco como travado. Revise o conteúdo ou busque recursos adicionais."
          : `Você tem ${stuck} blocos travados. Revise esses conteúdos antes de avançar.`,
      priority: "high",
      action: { label: "Ver revisões", href: "/revisar" },
    });
  }

  // Medium priority: in-progress items
  if (inProgress > 0) {
    const item = currentStudyState.currentItem;
    recommendations.push({
      id: "continue_in_progress",
      title: "Continue de onde parou",
      description: item
        ? `"${item.title}" está em andamento. Continue para manter o ritmo.`
        : `Você tem ${inProgress} ${inProgress === 1 ? "bloco em andamento" : "blocos em andamento"}.`,
      priority: "medium",
      action: { label: "Ver plano", href: "/plano" },
    });
  }

  // Medium priority: start next item if nothing in progress
  if (inProgress === 0 && currentItem && overdueItems.length === 0) {
    recommendations.push({
      id: "start_next",
      title: "Comece o próximo bloco",
      description: `"${currentItem.title}" é o próximo bloco do seu plano.`,
      priority: "medium",
      action: { label: "Ver plano", href: "/plano" },
    });
  }

  // Low priority: all clear, keep going
  if (overdueItems.length === 0 && stuck === 0 && pendingItems.length > 0) {
    recommendations.push({
      id: "on_track",
      title: "Você está no ritmo",
      description: "Sem atrasos nem travamentos. Continue avançando no plano.",
      priority: "low",
    });
  }

  return recommendations.sort((a, b) => {
    const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });
}
