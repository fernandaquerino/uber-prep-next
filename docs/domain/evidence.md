# Domínio de Evidências

`EvidenceRecord` normaliza sinais provenientes dos módulos sem apagar a origem.

## Fontes

- `plan`
- `review`
- `flashcard`
- `quiz`
- `playground`
- `timer`
- `mock`
- `note`
- `resource`
- `technical_english`

## Regras

- Quizzes, revisões, testes do Playground e rubricas de mocks são evidências avaliáveis.
- Conclusões do plano e práticas registradas demonstram execução.
- Tempo, notas e recursos demonstram atividade e contexto, não domínio.
- Registros sem tópico confiável podem contribuir para métricas da área, mas não inventam domínio por tópico.
- Revisões atrasadas são evidências negativas explícitas.

O snapshot é derivado a partir do IndexedDB e não é persistido.
