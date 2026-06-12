"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { getCategoryVisual, getCategoryLabel } from "@/lib/presentation/category-visuals";
import { STUDY_TOPICS } from "@/lib/data/note-topics";

const CATEGORY_KEYS = ["algo", "system", "js", "fe_coding", "mock", "behavioral"] as const;

export type NavigationProps = {
  mode: "areas" | "topics";
  onModeChange: (mode: "areas" | "topics") => void;
  selectedCategory: string | null;
  selectedTopicId: string | null;
  onSelectCategory: (cat: string | null) => void;
  onSelectTopic: (topicId: string | null) => void;
  noteCounts: {
    byCategory: Record<string, number>;
    byTopic: Record<string, number>;
  };
};

export function NotesNavigation({
  mode,
  onModeChange,
  selectedCategory,
  selectedTopicId,
  onSelectCategory,
  onSelectTopic,
  noteCounts,
}: NavigationProps) {
  const [topicSearch, setTopicSearch] = useState("");

  const filteredTopics = topicSearch.trim()
    ? STUDY_TOPICS.filter((t) =>
        t.label.toLowerCase().includes(topicSearch.toLowerCase()),
      )
    : STUDY_TOPICS;

  // Group topics by category for display
  const groupedTopics = CATEGORY_KEYS.map((cat) => ({
    category: cat,
    topics: filteredTopics.filter((t) => t.category === cat),
  })).filter((g) => g.topics.length > 0);

  return (
    <div className="space-y-3">
      {/* Mode tabs */}
      <div className="flex gap-1 border-b border-border">
        {(["areas", "topics"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onModeChange(m)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              mode === m
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {m === "areas" ? "Áreas" : "Tópicos"}
          </button>
        ))}
      </div>

      {/* Areas mode */}
      {mode === "areas" && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onSelectCategory(null)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors",
              selectedCategory === null
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:bg-muted",
            )}
          >
            Todas
            <span className="opacity-70">
              {Object.values(noteCounts.byCategory).reduce((s, n) => s + n, 0)}
            </span>
          </button>
          {CATEGORY_KEYS.map((cat) => {
            const visual = getCategoryVisual(cat);
            const label = getCategoryLabel(cat);
            const count = noteCounts.byCategory[cat] ?? 0;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectCategory(isSelected ? null : cat)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors",
                  isSelected
                    ? visual.badge
                    : "bg-background text-muted-foreground border-border hover:bg-muted",
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", visual.dot)} />
                {label}
                {count > 0 && <span className="opacity-70">{count}</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Topics mode */}
      {mode === "topics" && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar tópico..."
              value={topicSearch}
              onChange={(e) => setTopicSearch(e.target.value)}
              className="pl-8 h-8 text-sm"
              aria-label="Buscar tópico"
            />
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {groupedTopics.length === 0 && (
              <p className="text-xs text-muted-foreground py-2 text-center">
                Nenhum tópico encontrado.
              </p>
            )}
            {groupedTopics.map(({ category, topics }) => {
              const visual = getCategoryVisual(category);
              const catLabel = getCategoryLabel(category);
              return (
                <div key={category}>
                  <p className={cn("text-xs font-semibold mb-1.5", visual.text)}>{catLabel}</p>
                  <div className="flex flex-col gap-0.5">
                    {topics.map((topic) => {
                      const count = noteCounts.byTopic[topic.id] ?? 0;
                      const isSelected = selectedTopicId === topic.id;
                      return (
                        <button
                          key={topic.id}
                          type="button"
                          onClick={() => onSelectTopic(isSelected ? null : topic.id)}
                          className={cn(
                            "flex items-center justify-between rounded px-2 py-1 text-sm text-left transition-colors",
                            isSelected
                              ? cn(visual.background, visual.text, "font-medium")
                              : "hover:bg-muted text-foreground",
                          )}
                        >
                          <span>{topic.label}</span>
                          {count > 0 && (
                            <span className="text-xs text-muted-foreground">{count}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
