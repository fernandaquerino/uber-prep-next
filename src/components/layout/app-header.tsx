"use client";

import { useCurrentPage } from "@/hooks/use-current-page";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { SearchIcon } from "lucide-react";
import { TimerCompact } from "../features/timer/timer-compact";
import { NotificationsPanel } from "../features/notifications/notifications-panel";
import { CommandSearch } from "../features/search/command-search";

export function AppHeader() {
  const currentPage = useCurrentPage();
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="bg-surface supports-[backdrop-filter]:bg-surface sticky top-0 z-40 flex h-14 items-center gap-2 border-b px-4 backdrop-blur">
      <h1 className="font-heading text-text-primary flex-1 text-base font-bold">
        {currentPage?.label}
      </h1>

      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        aria-label="Abrir busca"
        className={cn(
          "border-border bg-background text-muted-foreground hover:border-text-muted relative flex h-9 w-56 items-center rounded-lg border py-0 pr-2.5 pl-9 text-sm transition-colors outline-none",
        )}
      >
        <SearchIcon
          className="text-muted-foreground pointer-events-none absolute left-3 size-3.5"
          aria-hidden="true"
        />
        <span className="flex-1 truncate text-left">Buscar páginas…</span>
        <kbd
          aria-hidden="true"
          className="border-border bg-surface-muted text-muted-foreground ml-2 hidden items-center gap-0.5 rounded border px-1.5 py-0.5 font-mono text-[10px] select-none sm:flex"
        >
          ⌘K
        </kbd>
      </button>

      <TimerCompact />

      <NotificationsPanel />

      <CommandSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
