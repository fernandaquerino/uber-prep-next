"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type ResourcesDashboardData = {
  inProgress: number;
  completedThisWeek: number;
  forReview: number;
  practicedRecently: number;
};

async function loadDashboardData(): Promise<ResourcesDashboardData> {
  const { getDb } = await import("@/lib/db/db");
  const { getResourcesDashboardData } = await import("@/lib/application/resources");
  const { getTechEnglishDashboardData } = await import("@/lib/application/technical-english");
  const db = getDb();
  const [resources, english] = await Promise.all([
    getResourcesDashboardData(db),
    getTechEnglishDashboardData(db),
  ]);
  return { ...resources, ...english };
}

export function DashboardResourcesCompact() {
  const [data, setData] = useState<ResourcesDashboardData | null>(null);

  useEffect(() => {
    loadDashboardData()
      .then(setData)
      .catch(() => null);
  }, []);

  if (!data) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasActivity =
    data.inProgress > 0 ||
    data.completedThisWeek > 0 ||
    data.forReview > 0 ||
    data.practicedRecently > 0;

  if (!hasActivity) return null;

  return (
    <Card>
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <BookOpen className="size-4 text-muted-foreground" />
          Recursos & Inglês
          <Link
            href="/recursos"
            className="ml-auto text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5"
          >
            Ver tudo
            <ExternalLink className="size-3" />
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-3">
        <div className="grid grid-cols-2 gap-2">
          {data.inProgress > 0 && (
            <div className="bg-muted/50 rounded p-2 text-center">
              <div className="text-lg font-semibold">{data.inProgress}</div>
              <div className="text-xs text-muted-foreground">Em andamento</div>
            </div>
          )}
          {data.completedThisWeek > 0 && (
            <div className="bg-green-50 dark:bg-green-950/20 rounded p-2 text-center">
              <div className="text-lg font-semibold text-green-700 dark:text-green-300">
                {data.completedThisWeek}
              </div>
              <div className="text-xs text-muted-foreground">Concluídos (semana)</div>
            </div>
          )}
          {data.forReview > 0 && (
            <div className="bg-orange-50 dark:bg-orange-950/20 rounded p-2 text-center">
              <div className="text-lg font-semibold text-orange-700 dark:text-orange-300">
                {data.forReview}
              </div>
              <div className="text-xs text-muted-foreground">Inglês p/ revisar</div>
            </div>
          )}
          {data.practicedRecently > 0 && (
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded p-2 text-center">
              <div className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                {data.practicedRecently}
              </div>
              <div className="text-xs text-muted-foreground">Práticas (semana)</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
