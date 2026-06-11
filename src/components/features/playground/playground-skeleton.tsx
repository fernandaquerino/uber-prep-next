import { Skeleton } from "@/components/ui/skeleton";

export function PlaygroundEditorSkeleton() {
  return (
    <div className="grid gap-3" aria-label="Carregando editor do playground">
      <div className="border-border overflow-hidden rounded-lg border">
        <div className="bg-muted/50 flex items-center gap-2 border-b px-3 py-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="ml-auto h-3 w-20" />
        </div>
        <div className="grid h-[380px] grid-cols-[3rem_1fr] gap-3 p-3">
          <div className="grid content-start gap-2">
            {Array.from({ length: 13 }, (_, index) => (
              <Skeleton key={index} className="h-3 w-6" />
            ))}
          </div>
          <div className="grid content-start gap-3">
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/5" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PlaygroundSavedSkeleton() {
  return (
    <div className="grid gap-3" aria-label="Carregando soluções salvas">
      <div className="grid gap-1">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-full rounded-lg" />
      </div>
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="border-border rounded-lg border p-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="grid flex-1 gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
              <Skeleton className="h-3 w-32" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-7 w-14 rounded-lg" />
              <Skeleton className="h-7 w-20 rounded-lg" />
              <Skeleton className="h-7 w-16 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
