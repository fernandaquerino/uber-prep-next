export type NoteTemplate = {
  id: string;
  name: string;
  category?: string;
  content: string;
};

export const NOTE_TEMPLATES: NoteTemplate[] = [
  {
    id: "algoritmos",
    name: "Algoritmos",
    category: "algo",
    content: `# Algoritmo: [Nome]

## Problema

Descreva o problema que este algoritmo resolve.

## Abordagem

Explique a estratégia principal (ex: dois ponteiros, janela deslizante, programação dinâmica).

## Complexidade

- **Tempo:** O(n)
- **Espaço:** O(1)

## Padrão

\`\`\`javascript
function solve(input) {
  // Implementação aqui
}
\`\`\`

## Casos de borda

- [ ] Array vazio
- [ ] Um único elemento
- [ ] Valores negativos
- [ ] Duplicatas

## Exemplos

\`\`\`
Entrada: [1, 2, 3]
Saída:   6
\`\`\`

## Referências

- LeetCode #
- Notas adicionais
`,
  },
  {
    id: "frontend-system-design",
    name: "Frontend System Design",
    category: "system",
    content: `# System Design: [Nome do componente/feature]

## Requisitos

### Funcionais
-
-

### Não-funcionais
- Performance:
- Escalabilidade:
- Acessibilidade:

## Componentes principais

### Estrutura de dados

\`\`\`typescript
interface Example {
  // Defina aqui
}
\`\`\`

### APIs / Interfaces

\`\`\`
GET /api/...
POST /api/...
\`\`\`

## Decisões de design

| Decisão | Alternativas | Justificativa |
|---------|-------------|---------------|
|         |             |               |

## Tradeoffs

- ✅ Vantagem:
- ⚠️ Desvantagem:

## Pontos de discussão

- Como lidar com erros?
- Como lidar com estados de loading?
- Como garantir acessibilidade?
- Como otimizar para re-renders?

## Diagrama

\`\`\`
[Componente A] → [Componente B]
                      ↓
               [Serviço / API]
\`\`\`
`,
  },
  {
    id: "javascript",
    name: "JavaScript",
    category: "js",
    content: `# Conceito JavaScript: [Nome]

## O que é

Explique o conceito em uma ou duas frases.

## Como funciona

Explique o mecanismo interno.

## Exemplo básico

\`\`\`javascript
// Exemplo aqui
\`\`\`

## Exemplo avançado

\`\`\`javascript
// Caso mais complexo
\`\`\`

## Armadilhas comuns

-
-

## Perguntas frequentes em entrevista

1. Qual a diferença entre X e Y?
2. Como o event loop afeta este conceito?

## Referências

- MDN:
- Notas pessoais:
`,
  },
  {
    id: "behavioral-star",
    name: "Behavioral (STAR)",
    category: "behavioral",
    content: `# Situação Behavioral: [Tema]

## Pergunta

> "Conte sobre uma vez em que..."

## Situação

Contexto: onde, quando, qual era o cenário.

## Tarefa

O que era esperado de você? Qual era o seu papel?

## Ação

O que você fez especificamente?

1.
2.
3.

## Resultado

O que aconteceu? Qual foi o impacto?

- Métrica / resultado concreto:
- Aprendizado:

## Variações da pergunta

-
-

## Notas de prática

- Data da última prática:
- Pontos a melhorar:
`,
  },
  {
    id: "mock",
    name: "Mock Interview",
    category: "mock",
    content: `# Mock: [Tipo] — [Data]

## Pergunta / Enunciado

Cole aqui a pergunta do mock.

## Minha solução

\`\`\`javascript
// Código ou esboço aqui
\`\`\`

## Feedback recebido

### Pontos fortes
-

### Pontos de melhoria
-

### Próximos passos
-

## Análise pós-mock

### O que funcionou bem
-

### O que faria diferente
-

## Rubrica

| Critério | Nota (1-4) | Observações |
|----------|-----------|-------------|
| Clareza  |           |             |
| Solução  |           |             |
| Comunicação |        |             |
| Trade-offs |         |             |
`,
  },
];

export function getNoteTemplate(id: string): NoteTemplate | undefined {
  return NOTE_TEMPLATES.find((t) => t.id === id);
}
