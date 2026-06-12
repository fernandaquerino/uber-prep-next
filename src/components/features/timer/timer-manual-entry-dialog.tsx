"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTimer } from "@/hooks/use-timer";
import { getLocalDateString } from "@/lib/application/timer";
import { TIMER_CATEGORY_OPTIONS } from "./timer-options";

export function TimerManualEntryDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { actions } = useTimer();
  const [date, setDate] = useState(getLocalDateString());
  const [durationMinutes, setDurationMinutes] = useState(40);
  const [category, setCategory] = useState("general");
  const [title, setTitle] = useState("Estudo manual");
  const [notes, setNotes] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await actions.addManual({
      date,
      durationSeconds: durationMinutes * 60,
      category,
      title,
      notes: notes.trim() || undefined,
    });
    if (result) onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar tempo manual</DialogTitle>
          <DialogDescription>Registre tempo estudado sem usar o timer.</DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={(event) => void onSubmit(event)}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="manual-date">Data</Label>
              <Input
                id="manual-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="manual-duration">Duração em minutos</Label>
              <Input
                id="manual-duration"
                type="number"
                min={1}
                max={720}
                value={durationMinutes}
                onChange={(event) => setDurationMinutes(Number(event.target.value))}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="manual-title">Título</Label>
            <Input
              id="manual-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>

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

          <div className="grid gap-2">
            <Label htmlFor="manual-notes">Notas</Label>
            <Textarea
              id="manual-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Registrar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
