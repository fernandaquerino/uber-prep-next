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
        <h3 className="text-sm font-medium mb-1">Disponibilidade semanal</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Configure quais dias você estuda e quantos minutos por dia.
        </p>

        <div className="space-y-2">
          {WEEKDAY_ORDER.map((day) => {
            const config = availability[day];
            return (
              <div
                key={day}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  config.enabled ? "border-border bg-background" : "border-border/50 bg-muted/30"
                }`}
              >
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={config.enabled}
                  onClick={() => toggleDay(day)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
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
                  className={`text-sm font-medium w-32 ${config.enabled ? "" : "text-muted-foreground"}`}
                >
                  {WEEKDAY_LABELS[day]}
                </span>

                <div className="flex items-center gap-2 flex-1">
                  <Input
                    type="number"
                    min={0}
                    max={720}
                    step={30}
                    value={config.enabled ? config.availableMinutes : 0}
                    onChange={(e) => setMinutes(day, e.target.value)}
                    disabled={!config.enabled}
                    className="h-8 w-24 text-sm"
                    aria-label={`Minutos para ${WEEKDAY_LABELS[day]}`}
                  />
                  <span className="text-xs text-muted-foreground">
                    {config.enabled ? formatMinutes(config.availableMinutes) : "Descanso"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 text-sm">
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

        <div className="hidden sm:flex gap-1">
          {WEEKDAY_ORDER.map((day) => (
            <span
              key={day}
              className={`text-xs px-1.5 py-0.5 rounded ${
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
