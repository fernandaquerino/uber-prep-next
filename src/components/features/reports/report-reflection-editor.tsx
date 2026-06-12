"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { WeeklyReportReflection } from "@/lib/domain/reports";

export function ReportReflectionEditor({
  value,
  onSave,
}: {
  value: WeeklyReportReflection;
  onSave: (value: WeeklyReportReflection) => Promise<void>;
}) {
  const [reflection, setReflection] = useState(value);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function field(key: keyof WeeklyReportReflection, label: string, placeholder: string) {
    const id = `report-reflection-${key}`;
    return (
      <div className="space-y-1.5">
        <Label htmlFor={id}>{label}</Label>
        <Textarea
          id={id}
          rows={2}
          value={String(reflection[key] ?? "")}
          placeholder={placeholder}
          onChange={(event) =>
            setReflection((current) => ({ ...current, [key]: event.target.value }))
          }
        />
      </div>
    );
  }

  const dirty =
    reflection.content !== value.content ||
    reflection.wins !== value.wins ||
    reflection.blockers !== value.blockers ||
    reflection.whatWorked !== value.whatWorked ||
    reflection.whatToAdjust !== value.whatToAdjust;

  return (
    <section className="report-section space-y-4" aria-labelledby="report-reflection-heading">
      <div>
        <h2 id="report-reflection-heading" className="text-lg font-semibold">
          Reflexão semanal
        </h2>
        <p className="text-muted-foreground text-sm">
          Esta é a mesma reflexão exibida em Revisar Hoje.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {field("wins", "O que evoluiu?", "Conquistas e avanços da semana")}
        {field("blockers", "O que ficou difícil?", "Obstáculos e dificuldades")}
        {field("whatWorked", "O que funcionou?", "Abordagens que deram resultado")}
        {field("whatToAdjust", "O que ajustar?", "Mudanças para a próxima semana")}
      </div>
      {field("content", "Observações gerais", "Conquista da semana e outras observações")}
      <div className="no-print flex items-center justify-end gap-3">
        {saved && <span className="text-sm text-emerald-600">Reflexão salva.</span>}
        <Button
          disabled={!dirty || saving}
          onClick={async () => {
            setSaving(true);
            try {
              await onSave(reflection);
              setSaved(true);
              window.setTimeout(() => setSaved(false), 2000);
            } finally {
              setSaving(false);
            }
          }}
        >
          {saving ? "Salvando..." : "Salvar reflexão"}
        </Button>
      </div>
    </section>
  );
}
