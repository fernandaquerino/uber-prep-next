"use client";

import { useCallback } from "react";
import { useMockActions } from "@/hooks/use-mock-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const LOOP_BLOCKS = [
  {
    range: "00–45 min",
    label: "Coding + testes",
    description: "Dois problemas de algoritmo. Pensar em voz alta, tratar edge cases.",
  },
  {
    range: "45–90 min",
    label: "System design RADIO",
    description: "Requirements → Architecture → Data → Interface → Observability.",
  },
  {
    range: "90–110 min",
    label: "Behavioral STAR",
    description: "2-3 perguntas situacionais com estrutura Situation → Task → Action → Result.",
  },
  {
    range: "110–120 min",
    label: "Debrief",
    description: "Perguntas ao entrevistador. Clareza, curiosidade, fit cultural.",
  },
];

export function FullInterviewTab({ onRefresh }: { onRefresh: () => void }) {
  const { createMock, isLoading } = useMockActions(onRefresh);

  const handleRegister = useCallback(async () => {
    await createMock({
      type: "full_loop",
      title: `Entrevista completa — ${new Date().toLocaleDateString("pt-BR")}`,
      status: "in_progress",
    });
  }, [createMock]);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-muted-foreground mb-1 text-xs font-semibold tracking-wide uppercase">
          Modo entrevista completa
        </p>
        <p className="text-muted-foreground text-sm">
          Simule um loop com coding, system design, behavioral e debrief. O coding começa pelo
          tópico mais fraco identificado nos quizzes e revisões.
        </p>
      </div>

      {/* Time blocks */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {LOOP_BLOCKS.map((block) => (
          <Card key={block.range} className="bg-card/60">
            <CardContent className="p-4">
              <div className="text-primary mb-1 font-mono text-xs font-semibold">{block.range}</div>
              <div className="text-sm font-medium">{block.label}</div>
              <div className="text-muted-foreground mt-0.5 text-xs">{block.description}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tips */}
      <div className="space-y-1">
        <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          Sinais de prontidão
        </p>
        <ul className="text-muted-foreground space-y-1 text-sm">
          <li>• Consegue resolver 2 problemas de algoritmo em 45 minutos sem dicas</li>
          <li>• System design estruturado e coerente em 45 minutos</li>
          <li>• Respostas STAR concisas em menos de 3 minutos cada</li>
          <li>• Mantém foco e comunicação claros durante as 2h</li>
        </ul>
      </div>

      {/* Checklist quick ref */}
      <div className="space-y-1">
        <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          Antes de começar
        </p>
        <ul className="text-muted-foreground space-y-1 text-sm">
          <li>• Câmera, microfone e editor testados</li>
          <li>• Ambiente silencioso, conexão estável</li>
          <li>• Cheatsheet de complexidades disponível</li>
          <li>• 3-5 histórias STAR prontas em inglês</li>
        </ul>
      </div>

      <div className="pt-2">
        <Button onClick={handleRegister} disabled={isLoading}>
          Registrar simulação completa
        </Button>
        <p className="text-muted-foreground mt-2 text-xs">
          Cria um registro de mock tipo &ldquo;Full Loop&rdquo; onde você pode preencher rubrica,
          feedback e gaps depois.
        </p>
      </div>
    </div>
  );
}
