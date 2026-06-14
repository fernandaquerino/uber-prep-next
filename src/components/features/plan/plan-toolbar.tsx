"use client";

import type { ScheduledWeek, CalendarDate } from "@/lib/domain/schedule";
import { Button } from "@/components/ui/button";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ListFilterIcon,
  PlusIcon,
  Settings2Icon,
} from "lucide-react";
import { formatCalendarDate } from "./plan-utils";
import { cn } from "@/lib/utils";

type PlanToolbarProps = {
  weeks: ScheduledWeek[];
  selectedWeekId: string;
  today: CalendarDate;
  startDate: CalendarDate;
  filtersOpen: boolean;
  onSelectWeek: (id: string) => void;
  onToggleFilters: () => void;
  onChangeStartDate: () => void;
};

function formatWeekRange(start: CalendarDate, end: CalendarDate): string {
  const [, sm, sd] = start.split("-").map(Number);
  const [ey, em, ed] = end.split("-").map(Number);
  const monthName = new Date(Date.UTC(ey, em - 1, ed)).toLocaleDateString("pt-BR", {
    month: "long",
    timeZone: "UTC",
  });
  if (sm === em) {
    return `${sd} – ${ed} de ${monthName} de ${ey}`;
  }
  const startMonth = new Date(Date.UTC(ey, sm - 1, sd)).toLocaleDateString("pt-BR", {
    month: "short",
    timeZone: "UTC",
  });
  return `${sd} de ${startMonth} – ${ed} de ${monthName} de ${ey}`;
}

export function PlanToolbar({
  weeks,
  selectedWeekId,
  today,
  startDate,
  filtersOpen,
  onSelectWeek,
  onToggleFilters,
  onChangeStartDate,
}: PlanToolbarProps) {
  const selectedIndex = weeks.findIndex((w) => w.id === selectedWeekId);
  const selectedWeek = weeks[selectedIndex];
  const hasPrev = selectedIndex > 0;
  const hasNext = selectedIndex >= 0 && selectedIndex < weeks.length - 1;
  const isCurrentWeek = selectedWeek?.days.some((d) => d.date === today) ?? false;

  function go(offset: number) {
    const next = weeks[selectedIndex + offset];
    if (next) onSelectWeek(next.id);
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      {/* Week navigation */}
      <nav aria-label="Navegação por semana" className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => go(-1)}
          disabled={!hasPrev}
          aria-label="Semana anterior"
        >
          <ChevronLeftIcon aria-hidden />
        </Button>

        <div className="min-w-[12rem] text-center lg:text-left">
          <p className="text-text-primary text-base font-semibold">
            {isCurrentWeek ? "Esta semana" : `Semana ${selectedIndex + 1}`}
          </p>
          {selectedWeek && (
            <p className="text-muted text-xs">
              {formatWeekRange(selectedWeek.weekStart, selectedWeek.weekEnd)}
            </p>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => go(1)}
          disabled={!hasNext}
          aria-label="Próxima semana"
        >
          <ChevronRightIcon aria-hidden />
        </Button>
      </nav>

      {/* View toggle + actions */}
      <div className="flex flex-wrap items-center gap-2">
        <ViewToggle />

        <Button
          variant="secondary"
          size="sm"
          onClick={onChangeStartDate}
          title="Alterar data de início do plano"
          aria-label={`Alterar data de início do plano (início em ${formatCalendarDate(startDate)})`}
        >
          <Settings2Icon aria-hidden />
          Início: {formatCalendarDate(startDate, "short")}
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={onToggleFilters}
          aria-pressed={filtersOpen}
        >
          <ListFilterIcon aria-hidden />
          Filtrar
        </Button>

        {/* TODO: implementar criação de bloco (use case ausente no domínio) */}
        <Button size="sm" disabled title="Em breve">
          <PlusIcon aria-hidden />
          Adicionar bloco
        </Button>
      </div>
    </div>
  );
}

function ViewToggle() {
  return (
    <div
      role="tablist"
      aria-label="Modo de visualização"
      className="border-border bg-surface flex items-center rounded-lg border p-0.5"
    >
      <button
        role="tab"
        aria-selected
        className="text-text-primary bg-surface-muted rounded-md px-3 py-1 text-xs font-medium"
      >
        Semana
      </button>
      {/* TODO: visão Lista será reintroduzida em uma próxima entrega */}
      <button
        role="tab"
        aria-selected={false}
        disabled
        title="Em breve"
        className={cn("text-muted cursor-not-allowed rounded-md px-3 py-1 text-xs font-medium")}
      >
        Lista
      </button>
    </div>
  );
}
