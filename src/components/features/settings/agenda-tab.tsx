"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SettingsRecord, SettingsWeekdayAvailability } from "@/types/database";
import type { UpdateSettingsInput } from "@/lib/domain/settings";
import {
  WEEKDAY_LABELS,
  WEEKDAY_SHORT_LABELS,
  DEFAULT_START_TIME,
  getTotalWeeklyMinutes,
  getEnabledDaysCount,
  formatMinutes,
} from "@/lib/domain/settings";

type WeekdayKey = keyof SettingsWeekdayAvailability;
const WEEKDAY_ORDER: WeekdayKey[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

interface AgendaTabProps {
  settings: SettingsRecord;
  onUpdate: (input: UpdateSettingsInput) => Promise<void>;
}

export function AgendaTab({ settings, onUpdate }: AgendaTabProps) {
  const [availability, setAvailability] = useState<SettingsWeekdayAvailability>(
    settings.weekdayAvailability,
  );
  const [isSaving, setIsSaving] = useState(false);

  function toggleDay(day: WeekdayKey) {
    setAvailability((prev) => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled },
    }));
  }

  function setMinutes(day: WeekdayKey, raw: string) {
    const minutes = Math.max(0, Math.min(720, parseInt(raw || "0", 10)));
    setAvailability((prev) => ({
      ...prev,
      [day]: { ...prev[day], availableMinutes: minutes },
    }));
  }

  function setStartTime(day: WeekdayKey, value: string) {
    setAvailability((prev) => ({
      ...prev,
      [day]: { ...prev[day], startTime: value },
    }));
  }

  async function handleSave() {
    const enabledCount = getEnabledDaysCount(availability);
    if (enabledCount === 0) {
      toast.error("Habilite pelo menos um dia de estudo.");
      return;
    }
    setIsSaving(true);
    try {
      await onUpdate({ weekdayAvailability: availability });
      toast.success("Agenda salva.");
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setIsSaving(false);
    }
  }

  const totalMinutes = getTotalWeeklyMinutes(availability);
  const enabledDays = getEnabledDaysCount(availability);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-1 text-sm font-medium">Disponibilidade semanal</h3>
        <p className="text-muted-foreground mb-4 text-xs">
          Configure quais dias você estuda e quantos minutos por dia.
        </p>

        <div className="space-y-2">
          {WEEKDAY_ORDER.map((day) => {
            const config = availability[day];
            return (
              <div
                key={day}
                className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                  config.enabled ? "border-border bg-background" : "border-border/50 bg-muted/30"
                }`}
              >
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={config.enabled}
                  onClick={() => toggleDay(day)}
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                    config.enabled
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-muted-foreground/40"
                  }`}
                  aria-label={`${config.enabled ? "Desabilitar" : "Habilitar"} ${WEEKDAY_LABELS[day]}`}
                >
                  {config.enabled && (
                    <svg className="size-3" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>

                <span
                  className={`w-32 text-sm font-medium ${config.enabled ? "" : "text-muted-foreground"}`}
                >
                  {WEEKDAY_LABELS[day]}
                </span>

                <div className="flex flex-1 flex-wrap items-center gap-x-2 gap-y-1">
                  <Input
                    type="number"
                    min={0}
                    max={720}
                    step={30}
                    value={config.enabled ? config.availableMinutes : 0}
                    onChange={(e) => setMinutes(day, e.target.value)}
                    disabled={!config.enabled}
                    className="h-8 w-20 text-sm"
                    aria-label={`Minutos para ${WEEKDAY_LABELS[day]}`}
                  />
                  <span className="text-muted-foreground w-16 text-xs">
                    {config.enabled ? formatMinutes(config.availableMinutes) : "Descanso"}
                  </span>
                  {config.enabled && (
                    <label className="text-muted-foreground flex items-center gap-1.5 text-xs">
                      <span className="hidden sm:inline">Início</span>
                      <Input
                        type="time"
                        value={config.startTime ?? DEFAULT_START_TIME}
                        onChange={(e) => setStartTime(day, e.target.value)}
                        className="h-8 w-28 text-sm"
                        aria-label={`Horário de início para ${WEEKDAY_LABELS[day]}`}
                      />
                    </label>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-muted/50 flex items-center justify-between rounded-lg p-3 text-sm">
        <div className="flex gap-4">
          <span>
            <span className="font-medium">{enabledDays}</span>
            <span className="text-muted-foreground ml-1">dias/semana</span>
          </span>
          <span>
            <span className="font-medium">{formatMinutes(totalMinutes)}</span>
            <span className="text-muted-foreground ml-1">total semanal</span>
          </span>
        </div>

        <div className="hidden gap-1 sm:flex">
          {WEEKDAY_ORDER.map((day) => (
            <span
              key={day}
              className={`rounded px-1.5 py-0.5 text-xs ${
                availability[day].enabled
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {WEEKDAY_SHORT_LABELS[day]}
            </span>
          ))}
        </div>
      </div>

      <Button onClick={handleSave} disabled={isSaving} className="gap-2">
        <Save className="size-4" />
        {isSaving ? "Salvando..." : "Salvar agenda"}
      </Button>
    </div>
  );
}
