"use client";

import type { MocksSummaryVM } from "@/lib/presentation/mocks/mock-view-model";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, TrendingUp, AlertTriangle, Calendar } from "lucide-react";

type Props = { summary: MocksSummaryVM };

export function MockSummaryCards({ summary }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Card>
        <CardContent className="p-4">
          <div className="text-muted-foreground mb-1 flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            <span className="text-xs font-medium">Mocks concluídos</span>
          </div>
          <div className="text-2xl font-bold">{summary.completedMocks}</div>
          <div className="text-muted-foreground text-xs">de {summary.totalMocks} total</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="text-muted-foreground mb-1 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium">Score médio</span>
          </div>
          <div className="text-2xl font-bold">{summary.avgScoreLabel}</div>
          <div className="text-muted-foreground text-xs">nas rubricas avaliadas</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="text-muted-foreground mb-1 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-xs font-medium">Gaps recentes</span>
          </div>
          <div className="text-2xl font-bold">{summary.recentGapCount}</div>
          <div className="text-muted-foreground text-xs">últimos 14 dias</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="text-muted-foreground mb-1 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="text-xs font-medium">Último mock</span>
          </div>
          <div className="pt-1 text-2xl text-sm leading-tight font-bold">
            {summary.lastMockDateLabel}
          </div>
          <div className="text-muted-foreground text-xs">{summary.lastMockDate ?? "—"}</div>
        </CardContent>
      </Card>
    </div>
  );
}
