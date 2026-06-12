export type ChecklistGroup = {
  id: string;
  label: string;
  items: ChecklistGroupItem[];
};

export type ChecklistGroupItem = {
  id: string;
  text: string;
};

export const DEFAULT_CHECKLIST_GROUPS: ChecklistGroup[] = [
  {
    id: "coding",
    label: "Coding",
    items: [
      { id: "c1", text: "Clarificou requisitos antes de codificar" },
      { id: "c2", text: "Identificou o padrão correto (two pointers, sliding window, etc.)" },
      { id: "c3", text: "Discutiu complexidade de tempo e espaço" },
      { id: "c4", text: "Testou com pelo menos 2 exemplos" },
      { id: "c5", text: "Tratou edge cases (array vazio, null, duplicatas)" },
      { id: "c6", text: "Pensou em voz alta durante a solução" },
    ],
  },
  {
    id: "system-design",
    label: "System Design",
    items: [
      { id: "sd1", text: "Clarificou escala e requisitos funcionais" },
      { id: "sd2", text: "Definiu modelo de dados antes de APIs" },
      { id: "sd3", text: "Discutiu estratégia de cache e invalidação" },
      { id: "sd4", text: "Tratou paginação / cursor-based" },
      { id: "sd5", text: "Considerou loading, empty e error state na UI" },
      { id: "sd6", text: "Discutiu trade-offs explicitamente" },
      { id: "sd7", text: "Mencionou observabilidade e alertas" },
    ],
  },
  {
    id: "behavioral",
    label: "Behavioral",
    items: [
      { id: "b1", text: "Usou estrutura STAR completa" },
      { id: "b2", text: "Contexto em 2 frases sem excesso de detalhes" },
      { id: "b3", text: "Mostrou responsabilidade pessoal (não 'nós fizemos')" },
      { id: "b4", text: "Resultado mensurável (%, velocidade, $, usuários)" },
      { id: "b5", text: "Mencionou aprendizado ou mudança de comportamento" },
      { id: "b6", text: "Resposta em 2-3 minutos no máximo" },
    ],
  },
  {
    id: "communication",
    label: "Comunicação",
    items: [
      { id: "co1", text: "Não ficou em silêncio por mais de 60 segundos" },
      { id: "co2", text: "Fez perguntas de clarificação antes de começar" },
      { id: "co3", text: "Sinalizou quando mudou de abordagem" },
      { id: "co4", text: "Reconheceu limitações e pediu dicas quando travou" },
      { id: "co5", text: "Usou linguagem assertiva e clara" },
    ],
  },
  {
    id: "environment",
    label: "Ambiente",
    items: [
      { id: "e1", text: "Câmera e microfone testados antes" },
      { id: "e2", text: "Ambiente silencioso e sem distrações" },
      { id: "e3", text: "Editor/IDE configurado com atalhos" },
      { id: "e4", text: "Conexão estável e backup disponível" },
      { id: "e5", text: "Anotações ou cheatsheet de complexidades disponível" },
    ],
  },
  {
    id: "english",
    label: "Inglês técnico",
    items: [
      { id: "en1", text: "Praticou resposta STAR em inglês" },
      { id: "en2", text: "Revisou vocabulário de algorithm patterns em inglês" },
      { id: "en3", text: "Treinou descrever complexidade em inglês" },
      { id: "en4", text: "Preparou perguntas para o entrevistador em inglês" },
    ],
  },
  {
    id: "interview-day",
    label: "Dia da entrevista",
    items: [
      { id: "d1", text: "Dormiu bem na noite anterior" },
      { id: "d2", text: "Chegou ou entrou com 10 minutos de antecedência" },
      { id: "d3", text: "Leu o formato da entrevista novamente" },
      { id: "d4", text: "Fez uma rodada de aquecimento de code" },
      { id: "d5", text: "Revisou as perguntas STAR principais" },
    ],
  },
];

export function getAllDefaultChecklistItems(): Array<{
  group: string;
  id: string;
  text: string;
}> {
  return DEFAULT_CHECKLIST_GROUPS.flatMap((g) =>
    g.items.map((item) => ({ group: g.id, id: item.id, text: item.text })),
  );
}
