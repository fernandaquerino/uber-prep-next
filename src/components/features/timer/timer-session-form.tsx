"use client";

import { useState, type FormEvent } from "react";
import { Clock, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTimer } from "@/hooks/use-timer";
import type { TimerMode, TimerSourceType } from "@/types/database";
import { TimerPresets } from "./timer-presets";
import { TIMER_CATEGORY_OPTIONS, TIMER_SOURCE_OPTIONS } from "./timer-options";

type Props = {
  initialTitle?: string;
  initialCategory?: string;
  initialSourceType?: TimerSourceType;
  initialSourceId?: string;
  initialDurationSeconds?: number;
};

export function TimerSessionForm({
  initialTitle = "Sessão de foco",
  initialCategory = "general",
  initialSourceType = "general",
  initialSourceId,
  initialDurationSeconds,
}: Props) {
  const { data, actions } = useTimer();
  const settings = data?.settings;
  const [mode, setMode] = useState<TimerMode>(settings?.defaultMode ?? "countdown");
  const [title, setTitle] = useState(initialTitle);
  const [category, setCategory] = useState(initialCategory);
  const [sourceType, setSourceType] = useState<TimerSourceType>(initialSourceType);
  const [sourceId, setSourceId] = useState(initialSourceId ?? "");
  const [durationSeconds, setDurationSeconds] = useState(
    initialDurationSeconds ?? settings?.defaultPresetSeconds ?? 45 * 60,
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await actions.start({
      mode,
      title,
      category,
      sourceType,
      sourceId: sourceId.trim() || undefined,
      targetDurationSeconds: mode === "countdown" ? durationSeconds : undefined,
    });
  }

  return (
    <form className="grid gap-4" onSubmit={(event) => void onSubmit(event)}>
      <div className="grid gap-2">
        <Label htmlFor="timer-title">Título</Label>
        <Input
          id="timer-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Ex.: Two Sum #1"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2 text-sm">
          <span className="font-medium">Modo</span>
          <select
            value={mode}
            onChange={(event) => setMode(event.target.value as TimerMode)}
            className="border-input bg-background h-10 rounded-md border px-3 text-sm"
          >
            <option value="countdown">Contagem regressiva</option>
            <option value="stopwatch">Cronômetro</option>
          </select>
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Categoria</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="border-input bg-background h-10 rounded-md border px-3 text-sm"
          >
            {TIMER_CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {mode === "countdown" && (
        <div className="grid gap-2">
          <Label htmlFor="timer-duration">Duração</Label>
          <TimerPresets value={durationSeconds} onChange={setDurationSeconds} />
          <div className="flex items-center gap-2">
            <Input
              id="timer-duration"
              type="number"
              min={1}
              max={720}
              value={Math.round(durationSeconds / 60)}
              onChange={(event) => setDurationSeconds(Number(event.target.value) * 60)}
              className="w-28"
            />
            <span className="text-muted-foreground text-sm">minutos</span>
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2 text-sm">
          <span className="font-medium">Origem</span>
          <select
            value={sourceType}
            onChange={(event) => setSourceType(event.target.value as TimerSourceType)}
            className="border-input bg-background h-10 rounded-md border px-3 text-sm"
          >
            {TIMER_SOURCE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-2">
          <Label htmlFor="timer-source-id">ID da origem</Label>
          <Input
            id="timer-source-id"
            value={sourceId}
            onChange={(event) => setSourceId(event.target.value)}
            placeholder="Opcional"
          />
        </div>
      </div>

      <Button type="submit">
        {mode === "countdown" ? (
          <Clock className="h-4 w-4" aria-hidden />
        ) : (
          <Play className="h-4 w-4" aria-hidden />
        )}
        Iniciar foco
      </Button>
    </form>
  );
}
