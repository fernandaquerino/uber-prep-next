"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TimerSettingsRecord } from "@/types/database";
import type { TimerSettingsInput } from "@/lib/domain/settings";

const TIMER_PRESET_OPTIONS = [
  { label: "25 min (Pomodoro)", value: 25 * 60 },
  { label: "45 min", value: 45 * 60 },
  { label: "60 min", value: 60 * 60 },
  { label: "90 min", value: 90 * 60 },
];

const LONG_SESSION_OPTIONS = [
  { label: "2 horas", value: 2 * 60 * 60 },
  { label: "3 horas", value: 3 * 60 * 60 },
  { label: "4 horas", value: 4 * 60 * 60 },
  { label: "6 horas", value: 6 * 60 * 60 },
];

interface TimerTabProps {
  timerSettings: TimerSettingsRecord;
  onUpdate: (input: Partial<TimerSettingsInput>) => Promise<void>;
}

type BooleanTimerKey =
  | "soundEnabled"
  | "notificationsEnabled"
  | "confirmBeforeCancel"
  | "showCompactTimer";

const TIMER_BOOL_LABELS: Record<BooleanTimerKey, { label: string; description: string }> = {
  soundEnabled: {
    label: "Som ao fim do timer",
    description: "Reproduzir som quando o contador chegar a zero.",
  },
  notificationsEnabled: {
    label: "Notificações do navegador",
    description: "Enviar notificação quando o timer terminar.",
  },
  confirmBeforeCancel: {
    label: "Confirmar antes de cancelar",
    description: "Exibir diálogo antes de encerrar uma sessão em andamento.",
  },
  showCompactTimer: {
    label: "Timer compacto na barra",
    description: "Mostrar timer em tamanho reduzido ao navegar entre páginas.",
  },
};

export function TimerTab({ timerSettings, onUpdate }: TimerTabProps) {
  const [defaultMode, setDefaultMode] = useState(timerSettings.defaultMode);
  const [defaultPreset, setDefaultPreset] = useState(timerSettings.defaultPresetSeconds);
  const [longThreshold, setLongThreshold] = useState(timerSettings.longSessionThresholdSeconds);
  const [bools, setBools] = useState<Record<BooleanTimerKey, boolean>>({
    soundEnabled: timerSettings.soundEnabled,
    notificationsEnabled: timerSettings.notificationsEnabled,
    confirmBeforeCancel: timerSettings.confirmBeforeCancel,
    showCompactTimer: timerSettings.showCompactTimer,
  });
  const [isSaving, setIsSaving] = useState(false);

  function toggleBool(key: BooleanTimerKey) {
    setBools((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      await onUpdate({
        defaultMode,
        defaultPresetSeconds: defaultPreset,
        longSessionThresholdSeconds: longThreshold,
        ...bools,
      });
      toast.success("Configurações do timer salvas.");
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-1 text-sm font-medium">Timer padrão</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Modo padrão</Label>
            <Select
              value={defaultMode}
              onValueChange={(v) => {
                if (v) setDefaultMode(v as typeof defaultMode);
              }}
            >
              <SelectTrigger>
                <SelectValue>
                  {(v) =>
                    v === "countdown"
                      ? "Contagem regressiva"
                      : v === "stopwatch"
                        ? "Cronômetro"
                        : String(v ?? "")
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="countdown">Contagem regressiva</SelectItem>
                <SelectItem value="stopwatch">Cronômetro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Preset padrão</Label>
            <Select
              value={String(defaultPreset)}
              onValueChange={(v) => {
                if (v) setDefaultPreset(Number(v));
              }}
            >
              <SelectTrigger>
                <SelectValue>
                  {(v) =>
                    TIMER_PRESET_OPTIONS.find((o) => String(o.value) === String(v))?.label ??
                    String(v ?? "")
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {TIMER_PRESET_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={String(opt.value)}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Alerta de sessão longa</Label>
            <Select
              value={String(longThreshold)}
              onValueChange={(v) => {
                if (v) setLongThreshold(Number(v));
              }}
            >
              <SelectTrigger>
                <SelectValue>
                  {(v) =>
                    LONG_SESSION_OPTIONS.find((o) => String(o.value) === String(v))?.label ??
                    String(v ?? "")
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {LONG_SESSION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={String(opt.value)}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-muted-foreground text-xs">
              Avisa quando uma sessão ultrapassa esse tempo.
            </p>
          </div>
        </div>
      </div>

      <hr className="border-border" />

      <div>
        <h3 className="mb-3 text-sm font-medium">Comportamento</h3>
        <div className="space-y-2">
          {(
            Object.entries(TIMER_BOOL_LABELS) as [
              BooleanTimerKey,
              { label: string; description: string },
            ][]
          ).map(([key, meta]) => (
            <label
              key={key}
              className="hover:bg-muted/50 flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors"
            >
              <input
                type="checkbox"
                checked={bools[key]}
                onChange={() => toggleBool(key)}
                className="mt-0.5 rounded"
              />
              <div>
                <p className="text-sm font-medium">{meta.label}</p>
                <p className="text-muted-foreground text-xs">{meta.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <Button onClick={handleSave} disabled={isSaving} className="gap-2">
        <Save className="size-4" />
        {isSaving ? "Salvando..." : "Salvar timer"}
      </Button>
    </div>
  );
}
