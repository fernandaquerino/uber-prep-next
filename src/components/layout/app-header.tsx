"use client";

import { useCurrentPage } from "@/hooks/use-current-page";
import { cn } from "@/lib/utils";
import { SearchIcon } from "lucide-react";
import { TimerCompact } from "../features/timer/timer-compact";
import { NotificationsPanel } from "../features/notifications/notifications-panel";

export function AppHeader() {
  const currentPage = useCurrentPage();

  console.log({ currentPage });

  return (
    <header className="bg-surface supports-[backdrop-filter]:bg-surface sticky top-0 z-40 flex h-14 items-center gap-2 border-b px-4 backdrop-blur">
      <h1 className="font-heading text-text-primary flex-1 text-base font-bold">
        {currentPage?.label}
      </h1>

      <div className="relative flex items-center">
        <SearchIcon
          className="text-muted-foreground pointer-events-none absolute left-3 size-3.5"
          aria-hidden="true"
        />

        <input
          type="search"
          data-slot="search-input"
          className={cn(
            "border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-primary flex h-9 w-full rounded-lg border py-0 pr-3 pr-14 pl-9 text-sm transition-[border-color,box-shadow] duration-[140ms] outline-none focus-visible:shadow-[0_0_0_3px_hsl(var(--primary)_/_0.12)] disabled:cursor-not-allowed disabled:opacity-50",
          )}
          placeholder="Buscar tópicos, notas..."
        />

        <kbd
          aria-hidden="true"
          className="border-border bg-surface-muted text-muted-foreground pointer-events-none absolute right-2.5 hidden items-center gap-0.5 rounded border px-1.5 py-0.5 font-mono text-[10px] select-none sm:flex"
        >
          ⌘K
        </kbd>
      </div>

      <TimerCompact />

      <NotificationsPanel />
    </header>
  );
}
