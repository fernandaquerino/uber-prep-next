"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SearchIcon, type LucideIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { NAV_GROUPS } from "@/shared/constants/navigation";
import { cn } from "@/lib/utils";

type CommandSearchProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CommandSearch({ open, onOpenChange }: CommandSearchProps) {
  const [query, setQuery] = useState("");

  // Reset the query when closing so the palette always opens fresh.
  function handleOpenChange(next: boolean) {
    if (!next) setQuery("");
    onOpenChange(next);
  }

  const normalizedQuery = query.trim().toLowerCase();

  const groups = useMemo(() => {
    if (!normalizedQuery) return NAV_GROUPS;

    return NAV_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((item) => item.label.toLowerCase().includes(normalizedQuery)),
    })).filter((group) => group.items.length > 0);
  }, [normalizedQuery]);

  const hasResults = groups.length > 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="top-24 max-w-[calc(100%-2rem)] translate-y-0 gap-0 p-0 sm:max-w-2xl"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Busca</DialogTitle>
        <DialogDescription className="sr-only">
          Busque e abra qualquer página do app.
        </DialogDescription>

        <div className="border-border flex items-center border-b px-4">
          <SearchIcon className="text-muted-foreground mr-3 size-4" aria-hidden />
          <input
            autoFocus
            value={query}
            placeholder="Buscar páginas…"
            aria-label="Busca"
            className="text-foreground placeholder:text-muted-foreground h-12 min-w-0 flex-1 bg-transparent text-sm outline-none"
            onChange={(event) => setQuery(event.target.value)}
          />
          <kbd className="border-border bg-surface-muted text-muted-foreground hidden items-center rounded border px-1.5 py-0.5 font-mono text-[10px] select-none sm:flex">
            esc
          </kbd>
        </div>

        <div className="max-h-[28rem] overflow-y-auto p-2">
          {hasResults ? (
            groups.map((group) => (
              <div key={group.group} className="py-2">
                <p className="text-muted-foreground px-3 pb-2 text-[0.6875rem] font-medium tracking-[0.06em] uppercase">
                  {group.group}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <CommandSearchLink
                      key={item.href}
                      href={item.href}
                      icon={item.icon}
                      title={item.label}
                      onSelect={() => handleOpenChange(false)}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground px-3 py-8 text-center text-sm">
              Nenhuma página encontrada para “{query.trim()}”.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

type CommandSearchLinkProps = {
  href: string;
  icon: LucideIcon;
  title: string;
  onSelect: () => void;
};

function CommandSearchLink({ href, icon: Icon, title, onSelect }: CommandSearchLinkProps) {
  return (
    <Link
      href={href}
      onClick={onSelect}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors outline-none",
        "hover:bg-surface-muted focus-visible:bg-surface-muted focus-visible:ring-ring focus-visible:ring-2",
      )}
    >
      <span className="bg-primary-subtle text-primary flex size-8 shrink-0 items-center justify-center rounded-md">
        <Icon className="size-4" aria-hidden />
      </span>
      <span className="text-foreground min-w-0 flex-1 truncate font-medium">{title}</span>
    </Link>
  );
}
