import type { Metadata } from "next";
import { Suspense } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { Skeleton } from "@/components/ui/skeleton";
import { NotesScreen } from "@/components/features/notes/notes-screen";

export const metadata: Metadata = {
  title: "Notas",
  description: "Anotações de estudo por tópico.",
};

function NotesSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-9 w-28" />
      </div>
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
        <div className="space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
        <Skeleton className="h-[500px] w-full" />
      </div>
    </div>
  );
}

export default function NotasPage() {
  return (
    <PageContainer>
      <Suspense fallback={<NotesSkeleton />}>
        <NotesScreen />
      </Suspense>
    </PageContainer>
  );
}
