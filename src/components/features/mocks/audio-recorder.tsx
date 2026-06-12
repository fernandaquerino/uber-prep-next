"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Trash2 } from "lucide-react";

export type RecordingState =
  | { status: "idle" }
  | { status: "recording"; startedAt: number }
  | { status: "done"; blob: Blob; mimeType: string; durationSeconds: number }
  | { status: "error"; message: string };

type Props = {
  value: RecordingState;
  onChange: (state: RecordingState) => void;
};

function formatSeconds(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export function AudioRecorder({ value, onChange }: Props) {
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/ogg";
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const durationSeconds = Math.round((Date.now() - startedAt) / 1000);
        onChange({ status: "done", blob, mimeType, durationSeconds });
        stream.getTracks().forEach((t) => t.stop());
        if (timerRef.current) clearInterval(timerRef.current);
      };

      const startedAt = Date.now();
      recorder.start(500);
      mediaRef.current = recorder;
      setElapsed(0);
      onChange({ status: "recording", startedAt });

      timerRef.current = setInterval(() => {
        setElapsed(Math.round((Date.now() - startedAt) / 1000));
      }, 1000);
    } catch {
      onChange({ status: "error", message: "Permissão de microfone negada." });
    }
  }, [onChange]);

  const stopRecording = useCallback(() => {
    if (mediaRef.current && mediaRef.current.state !== "inactive") {
      mediaRef.current.stop();
    }
  }, []);

  const clearRecording = useCallback(() => {
    onChange({ status: "idle" });
    setElapsed(0);
  }, [onChange]);

  return (
    <div className="flex items-center gap-3">
      {value.status === "idle" && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={startRecording}
          className="gap-2"
        >
          <Mic className="h-3.5 w-3.5 text-red-500" />
          Gravar
        </Button>
      )}

      {value.status === "recording" && (
        <>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={stopRecording}
            className="gap-2 border-red-500 text-red-500"
          >
            <Square className="h-3.5 w-3.5 fill-current" />
            Parar
          </Button>
          <span className="font-mono text-sm tabular-nums text-red-500">
            {formatSeconds(elapsed)}
          </span>
          <span className="text-xs text-muted-foreground animate-pulse">Gravando…</span>
        </>
      )}

      {value.status === "done" && (
        <>
          <span className="text-xs text-muted-foreground">
            {formatSeconds(value.durationSeconds)} gravados
          </span>
          <audio
            src={URL.createObjectURL(value.blob)}
            controls
            className="h-8 max-w-[200px]"
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-muted-foreground"
            onClick={clearRecording}
            title="Remover gravação"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </>
      )}

      {value.status === "error" && (
        <span className="text-xs text-destructive">{value.message}</span>
      )}
    </div>
  );
}
