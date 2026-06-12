import type { Metadata } from "next";
import { Suspense } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { Skeleton } from "@/components/ui/skeleton";
import { ResourcesScreen } from "@/components/features/resources/resources-screen";

export const metadata: Metadata = {
  title: "Recursos",
  description: "Biblioteca de recursos de estudo e inglês técnico.",
};

function ResourcesSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <Skeleton className="h-10 w-64" />
      <div className="flex gap-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-36 w-full" />
        ))}
      </div>
    </div>
  );
}

export default function RecursosPage() {
  return (
    <PageContainer>
      <Suspense fallback={<ResourcesSkeleton />}>
        <ResourcesScreen />
      </Suspense>
    </PageContainer>
  );
}
