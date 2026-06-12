export const STAR_CATEGORIES = [
  "Leadership",
  "Conflict",
  "Ownership",
  "Failure",
  "Mentoring",
  "Ambiguity",
  "Impact",
  "Technical English",
];

export const STAR_QUESTIONS = [
  {
    id: "star-leadership-1",
    category: "Leadership",
    question: "Tell me about a time you led an initiative without formal authority.",
    focus: "Influência, alinhamento e tomada de decisão.",
    strongSignals: [
      "Define contexto e stakes rapidamente",
      "Mostra como alinhou pessoas com interesses diferentes",
      "Fecha com impacto mensurável",
    ],
    pitfalls: ["Focar só em execução individual", "Não explicar o conflito de prioridades"],
  },
  {
    id: "star-conflict-1",
    category: "Conflict",
    question: "Tell me about a disagreement with a teammate or stakeholder.",
    focus: "Conflito saudável, escuta e resolução.",
    strongSignals: [
      "Explica os dois lados com respeito",
      "Mostra evidências usadas para decidir",
      "Aponta mudança de processo ou relação depois",
    ],
    pitfalls: ["Culpar a outra pessoa", "Terminar sem aprendizado"],
  },
  {
    id: "star-ownership-1",
    category: "Ownership",
    question: "Tell me about a time you took ownership of a problem outside your scope.",
    focus: "Responsabilidade, iniciativa e follow-through.",
    strongSignals: [
      "Mostra por que o problema importava para o negócio",
      "Explica tradeoffs de assumir o trabalho",
      "Demonstra que acompanhou até resolver",
    ],
    pitfalls: ["Parecer heroísmo sem alinhamento", "Não quantificar resultado"],
  },
  {
    id: "star-failure-1",
    category: "Failure",
    question: "Tell me about a time you failed or made a technical mistake.",
    focus: "Autoconsciência, recuperação e prevenção.",
    strongSignals: [
      "Assume responsabilidade sem defensividade",
      "Explica ação corretiva concreta",
      "Mostra como evitou repetição",
    ],
    pitfalls: ["Escolher falha irrelevante", "Dizer que não falha"],
  },
  {
    id: "star-mentoring-1",
    category: "Mentoring",
    question: "Tell me about a time you helped another engineer grow.",
    focus: "Mentoria, feedback e multiplicação de impacto.",
    strongSignals: [
      "Mostra diagnóstico do gap da pessoa",
      "Explica acompanhamento e feedback",
      "Conecta crescimento individual ao time",
    ],
    pitfalls: ["Virar aula genérica", "Não mostrar mudança observável"],
  },
  {
    id: "star-ambiguity-1",
    category: "Ambiguity",
    question: "Tell me about a project where requirements were unclear.",
    focus: "Clarificação, priorização e redução de risco.",
    strongSignals: [
      "Lista perguntas que destravaram o escopo",
      "Divide incerteza em hipóteses testáveis",
      "Entrega uma versão incremental",
    ],
    pitfalls: ["Esperar requisitos perfeitos", "Não falar de tradeoffs"],
  },
  {
    id: "star-impact-1",
    category: "Impact",
    question: "Tell me about your most impactful technical contribution.",
    focus: "Impacto técnico e de negócio.",
    strongSignals: [
      "Começa pelo resultado",
      "Explica decisões técnicas difíceis",
      "Mostra métricas antes/depois",
    ],
    pitfalls: ["Descrever só stack", "Não separar contribuição pessoal do time"],
  },
  {
    id: "star-english-1",
    category: "Technical English",
    question: "Explain a complex technical decision you made to a non-technical stakeholder.",
    focus: "Comunicação clara em inglês.",
    strongSignals: [
      "Simplifica sem perder precisão",
      "Usa analogias breves e concretas",
      "Confirma entendimento e próximos passos",
    ],
    pitfalls: ["Usar jargão demais", "Falar só para engenheiros"],
  },
];

export const STAR_FRAME = [
  ["Situation", "Contexto em 2 frases: produto, time, problema e stakes."],
  ["Task", "Sua responsabilidade específica e o critério de sucesso."],
  ["Action", "Decisões, tradeoffs, comunicação e execução concreta."],
  ["Result", "Resultado mensurável, aprendizado e como mudou seu comportamento."],
];
