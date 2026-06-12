"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_GROUPS } from "@/shared/constants/navigation";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "../ui/button";

export function AppSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "border-border bg-surface hidden w-60 shrink-0 flex-col border-r transition-[width] duration-300 ease-in-out lg:flex",
        collapsed ? "w-[70px] min-w-[70px]" : "w-60 min-w-60",
      )}
      aria-label="Navegação principal"
    >
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-mono text-sm font-bold">
          <div className="bg-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7L6 3L10 7L6 11L2 7Z" fill="white" />
              <path d="M8.5 7L12 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          {!collapsed && (
            <div
              className={cn(
                "flex flex-col items-center whitespace-nowrap",
                "transition-all duration-200 ease-in-out",
                collapsed ? "translate-x-1 opacity-0" : "translate-x-0 opacity-100",
              )}
            >
              <p className="font-heading text-text-primary text-sm leading-[1.1] font-extrabold tracking-[-0.02em]">
                Uber
              </p>
              <p className="text-primary text-xs font-bold tracking-[0.012em] uppercase">Prep</p>
            </div>
          )}
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3" aria-label="Rotas do app">
        {NAV_GROUPS.map((group) => (
          <div key={group.group} className="flex flex-col gap-1">
            {!collapsed && (
              <p
                className={cn(
                  "text-muted p-2.5 text-[10px] font-semibold tracking-widest uppercase",
                  "transition-all duration-200 ease-in-out",
                  collapsed
                    ? "max-h-0 -translate-x-2 opacity-0"
                    : "max-h-6 translate-x-0 opacity-100",
                )}
              >
                {group.group}
              </p>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "hover:text-text-primary hover:bg-surface-muted flex items-center gap-2.5 rounded-lg p-2.5 text-xs font-medium transition-colors",
                    isActive
                      ? "text-primary bg-primary-subtle"
                      : "text-text-secondary bg-transparent",
                    collapsed ? "justify-center px-2" : "gap-3 px-3",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {!collapsed && <p>{item.label}</p>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-border flex shrink-0 flex-col gap-1 border-t p-2">
        <div className="hover:bg-surface-muted flex cursor-pointer items-center gap-2.5 rounded-[var(--radius)] px-2.5 py-2 transition-colors">
          <div className="bg-primary flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white">
            FQ
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-text-primary truncate text-xs leading-tight font-semibold">
                Fernanda Querino
              </div>

              <div className="text-text-muted text-[10px] leading-tight">Senior FE Engineer</div>
            </div>
          )}
        </div>
        <div className="flex justify-center gap-1">
          <ThemeToggle />
          <Button
            onClick={() => setCollapsed(!collapsed)}
            variant="ghost"
            size="icon"
            aria-label={collapsed ? "Expandir Sidebar" : "Recolher Sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
}
