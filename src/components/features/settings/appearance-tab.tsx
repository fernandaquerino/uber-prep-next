"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Save, Monitor, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SettingsRecord, AppTheme, AppDensity, NotesDefaultView } from "@/types/database";
import type { UpdateSettingsInput } from "@/lib/domain/settings";
import { DENSITY_LABELS, NOTES_VIEW_LABELS } from "@/lib/domain/settings";

interface AppearanceTabProps {
  settings: SettingsRecord;
  onUpdate: (input: UpdateSettingsInput) => Promise<void>;
}

const THEMES: { value: AppTheme; label: string; icon: React.ReactNode }[] = [
  { value: "light", label: "Claro", icon: <Sun className="size-4" /> },
  { value: "dark", label: "Escuro", icon: <Moon className="size-4" /> },
  { value: "system", label: "Sistema", icon: <Monitor className="size-4" /> },
];

const DENSITIES: AppDensity[] = ["compact", "default", "comfortable"];
const NOTES_VIEWS: NotesDefaultView[] = ["edit", "split", "preview"];

export function AppearanceTab({ settings, onUpdate }: AppearanceTabProps) {
  const { setTheme } = useTheme();
  const [theme, setThemeState] = useState<AppTheme>(settings.theme);
  const [density, setDensity] = useState<AppDensity>(settings.density);
  const [notesView, setNotesView] = useState<NotesDefaultView>(settings.notesDefaultView);
  const [reduceMotion, setReduceMotion] = useState(settings.reduceMotion);
  const [isSaving, setIsSaving] = useState(false);

  function handleThemeChange(val: AppTheme) {
    setThemeState(val);
    setTheme(val); // applies immediately via next-themes
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      await onUpdate({ theme, density, notesDefaultView: notesView, reduceMotion });
      toast.success("Aparência salva.");
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-1">Tema</h3>
        <div className="flex gap-2 flex-wrap">
          {THEMES.map(({ value, label, icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => handleThemeChange(value)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm transition-colors ${
                theme === value
                  ? "border-primary bg-primary/10 text-primary font-medium"
                  : "border-border hover:bg-muted"
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          A alteração é aplicada imediatamente. Salve para persistir.
        </p>
      </div>

      <hr className="border-border" />

      <div>
        <h3 className="text-sm font-medium mb-3">Interface</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Densidade</Label>
            <Select
              value={density}
              onValueChange={(v) => { if (v) setDensity(v as AppDensity); }}
            >
              <SelectTrigger>
                <SelectValue>
                  {(v) => (v ? (DENSITY_LABELS[v as AppDensity] ?? String(v)) : "Selecionar")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {DENSITIES.map((d) => (
                  <SelectItem key={d} value={d}>
                    {DENSITY_LABELS[d]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Modo padrão do editor de notas</Label>
            <Select
              value={notesView}
              onValueChange={(v) => { if (v) setNotesView(v as NotesDefaultView); }}
            >
              <SelectTrigger>
                <SelectValue>
                  {(v) => (v ? (NOTES_VIEW_LABELS[v as NotesDefaultView] ?? String(v)) : "Selecionar")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {NOTES_VIEWS.map((v) => (
                  <SelectItem key={v} value={v}>
                    {NOTES_VIEW_LABELS[v]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div>
        <label className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors">
          <input
            type="checkbox"
            checked={reduceMotion}
            onChange={() => setReduceMotion((v) => !v)}
            className="mt-0.5 rounded"
          />
          <div>
            <p className="text-sm font-medium">Reduzir animações</p>
            <p className="text-xs text-muted-foreground">
              Desativa transições e animações decorativas.
            </p>
          </div>
        </label>
      </div>

      <Button onClick={handleSave} disabled={isSaving} className="gap-2">
        <Save className="size-4" />
        {isSaving ? "Salvando..." : "Salvar aparência"}
      </Button>
    </div>
  );
}
