import type { Metadata } from "next";
import { Suspense } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/feedback/page-header";
import { MocksScreen } from "@/components/features/mocks/mocks-screen";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Mocks",
  description: "Simule entrevistas e avalie seu desempenho.",
};

export default function MocksPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Mock Interviews"
        description="Registros, STAR, System Design, Full Loop e checklist de preparação."
      />
      <Suspense
        fallback={
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        }
      >
        <MocksScreen />
      </Suspense>
    </PageContainer>
  );
}
