"use client";

import { Network } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SKILL_AREAS } from "@/lib/data/skill-topics";
import type { AnalyticsSnapshot, SkillState } from "@/lib/domain/analytics";
import { cn } from "@/lib/utils";

const STATE_LABELS: Record<SkillState, string> = {
  not_started: "Não iniciado",
  learning: "Em aprendizado",
  practicing: "Praticando",
  consistent: "Consistente",
  mastered: "Dominado",
  at_risk: "Em risco",
};

const STATE_STYLES: Record<SkillState, string> = {
  not_started: "bg-muted text-muted-foreground",
  learning: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  practicing: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300",
  consistent: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  mastered: "bg-green-600 text-white dark:bg-green-500",
  at_risk: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
};

export function DashboardSkillTree({ analytics }: { analytics: AnalyticsSnapshot }) {
  return (
    <section aria-labelledby="skill-tree-heading">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle id="skill-tree-heading" className="flex items-center gap-2 text-sm">
            <Network className="size-4" aria-hidden />
            Skill Tree
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {SKILL_AREAS.map((area) => {
            const skills = analytics.skills.filter((skill) => skill.area === area.id);
            if (skills.length === 0) return null;
            return (
              <details key={area.id} className="rounded-lg border p-3" open={area.id === "algo"}>
                <summary className="cursor-pointer text-sm font-medium">
                  {area.label} <span className="text-muted-foreground">({skills.length})</span>
                </summary>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {skills.map((skill) => (
                    <article key={skill.topicId} className="bg-muted/40 rounded-lg p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium">{skill.label}</p>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                            STATE_STYLES[skill.state],
                          )}
                        >
                          {STATE_LABELS[skill.state]}
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-1 text-xs">{skill.explanation}</p>
                      <div className="text-muted-foreground mt-2 flex flex-wrap gap-x-3 text-[11px]">
                        <span>{skill.evidenceCount} evidências</span>
                        <span>{skill.sourceCount} fontes</span>
                        <span>
                          Conhecimento:{" "}
                          {skill.knowledge === null ? "insuficiente" : `${skill.knowledge}%`}
                        </span>
                      </div>
                      <p className="mt-2 text-xs font-medium">{skill.nextAction}</p>
                    </article>
                  ))}
                </div>
              </details>
            );
          })}
        </CardContent>
      </Card>
    </section>
  );
}
