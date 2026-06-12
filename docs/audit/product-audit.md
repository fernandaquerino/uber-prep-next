# Auditoria de produto

## Respostas centrais

- **O que estudar agora?** Dashboard e Plano consultam `getCurrentStudyState` sobre a agenda efetiva.
- **O que revisar hoje?** Revisar Hoje usa a fila normalizada de revisões.
- **Estou atrasada?** Atrasos são derivados da data efetiva e aparecem no Dashboard e Plano.
- **Quanto evoluí?** Dashboard e Relatórios usam evidências reais, sem converter ausência de dados em zero.
- **Quais tópicos estão em risco?** A camada de evidências explica motivos e recomenda ações.
- **O que fazer depois?** Próximo estudo respeita descanso e disponibilidade configurada.
- **Onde estão registros e progresso?** Navegação principal expõe Notas, Mocks, Plano e Relatórios.
- **Como recuperar dados?** Configurações contém exportação, importação validada e reset confirmado.

## Consistência verificada

Dashboard, Plano, Revisar Hoje e Relatórios compartilham configurações, scheduler, agenda efetiva e seletores de progresso. Categorias e tópicos são normalizados na camada de domínio.

## Decisões

Métricas calculadas continuam somente leitura. Reflexões semanais são a exceção editável e usam a mesma fonte em Revisar Hoje e Relatórios.
