import { BarChart3, History, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { QuizTab } from "./quiz-labels";

export function QuizTabs({
  activeTab,
  onChange,
  dueCount,
}: {
  activeTab: QuizTab;
  onChange: (tab: QuizTab) => void;
  dueCount: number;
}) {
  const tabs: Array<{
    id: QuizTab;
    label: string;
    icon: typeof Sparkles;
  }> = [
    { id: "quizzes", label: "Quizzes", icon: Sparkles },
    { id: "reviews", label: `Revisões (${dueCount})`, icon: RotateCcw },
    { id: "history", label: "Histórico", icon: History },
    { id: "stats", label: "Estatísticas", icon: BarChart3 },
  ];

  return (
    <nav className="flex flex-wrap gap-2" aria-label="Seções de quizzes">
      {tabs.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <Button
            key={item.id}
            variant={isActive ? "secondary" : "outline"}
            size="sm"
            onClick={() => onChange(item.id)}
            aria-pressed={isActive}
            className={
              isActive
                ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/15"
                : undefined
            }
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            {item.label}
          </Button>
        );
      })}
    </nav>
  );
}
