"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useTimer } from "@/hooks/use-timer";
import { getCategoryLabel } from "@/lib/presentation/category-visuals";
import { TIMER_PRESETS_SECONDS } from "@/lib/domain/timer";

const FOCUS_CATEGORIES = ["algo", "system", "js", "fe_coding", "behavioral", "mock", "general"];

const ACTIVITIES = ["Aprender", "Praticar", "Revisar", "Mock", "Leitura"];

type Props = {
  onStarted?: () => void;
};

export function TimerFocusForm({ onStarted }: Props) {
  const { data, actions } = useTimer();
  const settings = data?.settings;

  const [category, setCategory] = useState("general");
  const [topic, setTopic] = useState("");
  const [activity, setActivity] = useState<string>(ACTIVITIES[0]);
  const [durationSeconds, setDurationSeconds] = useState(settings?.defaultPresetSeconds ?? 45 * 60);
  const [goal, setGoal] = useState("");

  const durationMinutes = Math.round(durationSeconds / 60);

  async function start() {
    const title = topic.trim() || `${activity} · ${getCategoryLabel(category)}`;
    const notes = [goal.trim() && `Objetivo: ${goal.trim()}`, `Atividade: ${activity}`]
      .filter(Boolean)
      .join("\n");

    await actions.start({
      mode: "countdown",
      title,
      category,
      sourceType: "general",
      targetDurationSeconds: durationSeconds,
      notes: notes || undefined,
    });
    onStarted?.();
  }

  return (
    <div className="grid gap-5">
      <Field label="Categoria">
        <div className="flex flex-wrap gap-1.5">
          {FOCUS_CATEGORIES.map((value) => (
            <Chip key={value} selected={category === value} onClick={() => setCategory(value)}>
              {getCategoryLabel(value)}
            </Chip>
          ))}
        </div>
      </Field>

      <Field label="Tópico" optional>
        <Input
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          placeholder="Ex: Reconciliation, Closures, Two Sum…"
        />
      </Field>

      <Field label="Tipo de atividade">
        <div className="flex flex-wrap gap-1.5">
          {ACTIVITIES.map((value) => (
            <Chip key={value} selected={activity === value} onClick={() => setActivity(value)}>
              {value}
            </Chip>
          ))}
        </div>
      </Field>

      <Field label="Duração">
        <div className="flex gap-2">
          {TIMER_PRESETS_SECONDS.map((seconds) => {
            const selected = durationSeconds === seconds;
            return (
              <button
                key={seconds}
                type="button"
                onClick={() => setDurationSeconds(seconds)}
                aria-pressed={selected}
                className={cn(
                  "flex-1 cursor-pointer rounded-[var(--radius-sm)] border px-1 py-[9px]",
                  "font-mono text-xs font-bold transition-all",
                  selected
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-surface-muted text-text-secondary",
                )}
              >
                {seconds / 60}min
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="Objetivo" optional>
        <Input
          value={goal}
          onChange={(event) => setGoal(event.target.value)}
          placeholder="O que você quer entender ou praticar nesta sessão?"
        />
      </Field>

      <Button size="lg" className="mt-0.5 w-full" onClick={() => void start()}>
        <Zap aria-hidden />
        Iniciar {durationMinutes}min · {getCategoryLabel(category)}
        {topic.trim() && ` / ${topic.trim()}`}
      </Button>
    </div>
  );
}

function Field({
  label,
  optional,
  children,
}: {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-text-secondary mb-2 text-[11px] font-semibold tracking-[0.06em] uppercase">
        {label}
        {optional && (
          <span className="text-muted-foreground ml-1 text-[11px] font-normal tracking-normal normal-case">
            (opcional)
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "cursor-pointer rounded-[var(--radius-sm)] border px-[11px] py-[5px] whitespace-nowrap",
        "text-[11px] font-[var(--font-body)] font-medium transition-all",
        selected
          ? "border-primary bg-primary-subtle text-primary"
          : "border-border bg-surface-muted text-text-secondary",
      )}
    >
      {children}
    </button>
  );
}
