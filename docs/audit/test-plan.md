# Plano de testes final

## Automatizado

- domínio: calendário, scheduler, progresso, revisão, quizzes, timer, mocks, evidências, readiness e relatórios;
- integração: migrations, IndexedDB, consistência do plano e backup;
- componentes: navegação, formulários, editores e estados;
- E2E: rotas, Dashboard, Plano, tema, mobile, Relatórios, importação inválida e reset cancelado.

## Bug bash manual

Executar em desktop e mobile:

1. novo usuário sem data inicial;
2. início em quinta-feira e domingo;
3. dados parciais e settings legadas;
4. plano com atrasos e plano concluído;
5. fila sem revisões e com revisões vencidas;
6. timer ativo durante navegação e reload;
7. mock com e sem áudio;
8. importação inválida, merge e replace;
9. reset cancelado e reset confirmado;
10. navegação offline após primeiro carregamento dos assets.

## Critério

Falhas de tipo, lint, formatação, testes, build ou E2E bloqueiam a conclusão. Cenários que dependem de APIs do dispositivo, como microfone e impressão, exigem verificação manual.
