"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
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
import type { SettingsRecord } from "@/types/database";
import type { UpdateSettingsInput } from "@/lib/domain/settings";
import { DATE_FORMAT_LABELS } from "@/lib/domain/settings";

interface GeneralTabProps {
  settings: SettingsRecord;
  onUpdate: (input: UpdateSettingsInput) => Promise<void>;
}

const COMMON_TIMEZONES = [
  "America/Sao_Paulo",
  "America/New_York",
  "America/Los_Angeles",
  "America/Chicago",
  "Europe/London",
  "Europe/Lisbon",
  "UTC",
];

export function GeneralTab({ settings, onUpdate }: GeneralTabProps) {
  const [displayName, setDisplayName] = useState(settings.displayName ?? "");
  const [targetDate, setTargetDate] = useState(settings.targetInterviewDate ?? "");
  const [mainFocus, setMainFocus] = useState(settings.mainFocus ?? "");
  const [timezone, setTimezone] = useState(settings.timezone);
  const [dateFormat, setDateFormat] = useState(settings.dateFormat);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    try {
      await onUpdate({
        displayName: displayName.trim() || undefined,
        targetInterviewDate: targetDate || undefined,
        mainFocus: mainFocus.trim() || undefined,
        timezone,
        dateFormat,
      });
      toast.success("Configurações gerais salvas.");
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-1">Perfil</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Informações opcionais exibidas no app. Nenhum dado é enviado a servidores.
        </p>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="display-name">Nome de exibição</Label>
            <Input
              id="display-name"
              placeholder="Seu nome (opcional)"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={80}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="target-date">Data alvo da entrevista</Label>
            <Input
              id="target-date"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Usada para calcular quanto tempo resta.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="main-focus">Foco principal</Label>
            <Input
              id="main-focus"
              placeholder="Ex: Frontend Engineer na Uber"
              value={mainFocus}
              onChange={(e) => setMainFocus(e.target.value)}
              maxLength={120}
            />
          </div>
        </div>
      </div>

      <hr className="border-border" />

      <div>
        <h3 className="text-sm font-medium mb-1">Localização</h3>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Fuso horário</Label>
            <Select value={timezone} onValueChange={(v) => { if (v) setTimezone(v); }}>
              <SelectTrigger className="w-64">
                <SelectValue>
                  {(v) => String(v ?? "Selecionar")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {COMMON_TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Formato de data</Label>
            <Select value={dateFormat} onValueChange={(v) => { if (v) setDateFormat(v as typeof dateFormat); }}>
              <SelectTrigger className="w-64">
                <SelectValue>
                  {(v) => (v ? (DATE_FORMAT_LABELS[v as keyof typeof DATE_FORMAT_LABELS] ?? String(v)) : "Selecionar")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(DATE_FORMAT_LABELS) as [typeof dateFormat, string][]).map(([k, label]) => (
                  <SelectItem key={k} value={k}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Button onClick={handleSave} disabled={isSaving} className="gap-2">
        <Save className="size-4" />
        {isSaving ? "Salvando..." : "Salvar alterações"}
      </Button>
    </div>
  );
}
