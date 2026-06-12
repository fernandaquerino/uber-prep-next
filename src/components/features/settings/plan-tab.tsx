"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SettingsRecord, LostDayPolicy } from "@/types/database";
import type { UpdateSettingsInput } from "@/lib/domain/settings";
import { LOST_DAY_POLICY_LABELS, LOST_DAY_POLICY_DESCRIPTIONS } from "@/lib/domain/settings";

interface PlanTabProps {
  settings: SettingsRecord;
  onUpdate: (input: UpdateSettingsInput) => Promise<void>;
}

const DURATION_OPTIONS = [4, 5, 6, 8, 10, 12];
const LOST_DAY_POLICIES: LostDayPolicy[] = ["shift", "reschedule", "skip", "keep"];

export function PlanTab({ settings, onUpdate }: PlanTabProps) {
  const [startDate, setStartDate] = useState(settings.startDate ?? "");
  const [duration, setDuration] = useState(String(settings.planDurationWeeks));
  const [lostDayPolicy, setLostDayPolicy] = useState<LostDayPolicy>(settings.lostDayPolicy);
  const [isSaving, setIsSaving] = useState(false);
  const [showImpact, setShowImpact] = useState(false);

  const startDateChanged = startDate !== (settings.startDate ?? "");
  const durationChanged = Number(duration) !== settings.planDurationWeeks;

  async function handleSave() {
    if ((startDateChanged || durationChanged) && !showImpact) {
      setShowImpact(true);
      return;
    }
    setIsSaving(true);
    try {
      await onUpdate({
        startDate: startDate || null,
        planDurationWeeks: Number(duration),
        lostDayPolicy,
      });
      toast.success("Configurações do plano salvas.");
      setShowImpact(false);
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-1">Plano de estudos</h3>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="start-date">Data inicial</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setShowImpact(false);
              }}
            />
            <p className="text-xs text-muted-foreground">
              Define o primeiro dia de estudo do plano.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>Duração do plano</Label>
            <Select value={duration} onValueChange={(v) => { if (v) { setDuration(v); setShowImpact(false); } }}>
              <SelectTrigger className="w-48">
                <SelectValue>
                  {(v) => (v ? `${v} semanas` : "Selecionar")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((w) => (
                  <SelectItem key={w} value={String(w)}>
                    {w} semanas
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {showImpact && (startDateChanged || durationChanged) && (
        <div className="flex gap-2 items-start p-3 rounded-md bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-300">
          <AlertTriangle className="size-4 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium">Impacto da alteração</p>
            {startDateChanged && (
              <p className="mt-1">Alterar a data inicial recalculará todas as datas futuras do plano.</p>
            )}
            {durationChanged && (
              <p className="mt-1">Alterar a duração pode adicionar ou remover semanas do plano.</p>
            )}
            <p className="mt-1">O progresso já registrado não será perdido.</p>
          </div>
        </div>
      )}

      <hr className="border-border" />

      <div>
        <h3 className="text-sm font-medium mb-1">Dias perdidos</h3>
        <p className="text-xs text-muted-foreground mb-3">
          O que fazer quando um dia de estudo passa sem atividade.
        </p>

        <div className="space-y-2">
          {LOST_DAY_POLICIES.map((policy) => (
            <label
              key={policy}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                lostDayPolicy === policy
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted/50"
              }`}
            >
              <input
                type="radio"
                name="lost-day-policy"
                value={policy}
                checked={lostDayPolicy === policy}
                onChange={() => setLostDayPolicy(policy)}
                className="mt-0.5"
              />
              <div>
                <p className="text-sm font-medium">{LOST_DAY_POLICY_LABELS[policy]}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {LOST_DAY_POLICY_DESCRIPTIONS[policy]}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <Button onClick={handleSave} disabled={isSaving} className="gap-2">
        <Save className="size-4" />
        {isSaving ? "Salvando..." : showImpact ? "Confirmar e salvar" : "Salvar alterações"}
      </Button>
    </div>
  );
}
