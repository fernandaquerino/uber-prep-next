"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useMocks } from "@/hooks/use-mocks";
import { buildMocksSummaryVM } from "@/lib/presentation/mocks/build-mock-view-model";
import { MockSummaryCards } from "./mock-summary-cards";
import { MockRecordsTab } from "./mock-records-tab";
import { StarTab } from "./star-tab";
import { SystemDesignTab } from "./system-design-tab";
import { FullInterviewTab } from "./full-interview-tab";
import { ChecklistTab } from "./checklist-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

type TabId = "records" | "full-interview" | "star" | "system-design" | "checklist";

const TAB_LIST: { id: TabId; label: string }[] = [
  { id: "records", label: "Registros" },
  { id: "full-interview", label: "Entrevista completa" },
  { id: "star", label: "Banco STAR" },
  { id: "system-design", label: "Templates system design" },
  { id: "checklist", label: "Checklist" },
];

function isValidTab(value: string | null): value is TabId {
  return TAB_LIST.some((t) => t.id === value);
}

export function MocksScreen() {
  const { data, isLoading, error, refresh } = useMocks();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const rawTab = searchParams.get("tab");
  const activeTab: TabId = isValidTab(rawTab) ? rawTab : "records";

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const summaryVM =
    data && !isLoading
      ? buildMocksSummaryVM(data.mocks, data.recentEvidence)
      : null;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        Erro ao carregar mocks: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {summaryVM && <MockSummaryCards summary={summaryVM} />}

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="flex overflow-x-auto w-full h-auto gap-0.5 p-0.5">
          {TAB_LIST.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="text-xs sm:text-sm whitespace-nowrap"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="records" className="mt-4">
          <MockRecordsTab
            mocks={data?.mocks ?? []}
            evidence={data?.recentEvidence ?? []}
            onRefresh={refresh}
          />
        </TabsContent>

        <TabsContent value="full-interview" className="mt-4">
          <FullInterviewTab onRefresh={refresh} />
        </TabsContent>

        <TabsContent value="star" className="mt-4">
          <StarTab onRefresh={refresh} />
        </TabsContent>

        <TabsContent value="system-design" className="mt-4">
          <SystemDesignTab onRefresh={refresh} />
        </TabsContent>

        <TabsContent value="checklist" className="mt-4">
          <ChecklistTab onRefresh={refresh} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
