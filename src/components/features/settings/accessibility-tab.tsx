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
import type { SettingsRecord, FontSizePreference } from "@/types/database";
import type { UpdateSettingsInput } from "@/lib/domain/settings";
import { FONT_SIZE_LABELS } from "@/lib/domain/settings";

interface AccessibilityTabProps {
  settings: SettingsRecord;
  onUpdate: (input: UpdateSettingsInput) => Promise<void>;
}

type BoolKey = "increasedContrast" | "showFocusOutline" | "disableSounds";

const BOOL_META: Record<BoolKey, { label: string; description: string }> = {
  increasedContrast: {
    label: "Contraste elevado",
    description: "Aumenta o contraste entre texto e fundo para melhor legibilidade.",
  },
  showFocusOutline: {
    label: "Foco visível reforçado",
    description: "Exibe borda mais evidente ao navegar com teclado.",
  },
  disableSounds: {
    label: "Desativar sons",
    description: "Remove todos os sons do aplicativo.",
  },
};

const FONT_SIZES: FontSizePreference[] = ["sm", "md", "lg"];

export function AccessibilityTab({ settings, onUpdate }: AccessibilityTabProps) {
  const [fontSize, setFontSize] = useState<FontSizePreference>(settings.fontSize);
  const [bools, setBools] = useState<Record<BoolKey, boolean>>({
    increasedContrast: settings.increasedContrast,
    showFocusOutline: settings.showFocusOutline,
    disableSounds: settings.disableSounds,
  });
  const [isSaving, setIsSaving] = useState(false);

  function toggleBool(key: BoolKey) {
    setBools((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      await onUpdate({ fontSize, ...bools });
      toast.success("Configurações de acessibilidade salvas.");
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-1">Tamanho de fonte</h3>
        <div className="space-y-1.5">
          <Label>Tamanho base do texto</Label>
          <Select
            value={fontSize}
            onValueChange={(v) => { if (v) setFontSize(v as FontSizePreference); }}
          >
            <SelectTrigger className="w-48">
              <SelectValue>
                {(v) => (v ? (FONT_SIZE_LABELS[v as FontSizePreference] ?? String(v)) : "Selecionar")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {FONT_SIZES.map((s) => (
                <SelectItem key={s} value={s}>
                  {FONT_SIZE_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <hr className="border-border" />

      <div>
        <h3 className="text-sm font-medium mb-3">Preferências visuais e sonoras</h3>
        <div className="space-y-2">
          {(Object.entries(BOOL_META) as [BoolKey, { label: string; description: string }][]).map(
            ([key, meta]) => (
              <label
                key={key}
                className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={bools[key]}
                  onChange={() => toggleBool(key)}
                  className="mt-0.5 rounded"
                />
                <div>
                  <p className="text-sm font-medium">{meta.label}</p>
                  <p className="text-xs text-muted-foreground">{meta.description}</p>
                </div>
              </label>
            ),
          )}
        </div>
      </div>

      <div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground space-y-1">
        <p className="font-medium text-foreground">Atalhos de teclado</p>
        <p>O aplicativo suporta navegação completa por teclado.</p>
        <p>
          Use <kbd className="px-1 py-0.5 rounded bg-muted border text-xs">Tab</kbd> para
          navegar e <kbd className="px-1 py-0.5 rounded bg-muted border text-xs">Enter</kbd> para
          ativar elementos.
        </p>
      </div>

      <Button onClick={handleSave} disabled={isSaving} className="gap-2">
        <Save className="size-4" />
        {isSaving ? "Salvando..." : "Salvar acessibilidade"}
      </Button>
    </div>
  );
}
