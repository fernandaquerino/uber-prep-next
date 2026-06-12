# Auditoria de UX

## Verificado

- prioridades no topo do Dashboard;
- estados de loading, vazio e erro nas rotas assíncronas;
- confirmações para ações destrutivas;
- manutenção de estado ao atualizar Plano e Relatórios;
- navegação desktop e mobile;
- ausência de overflow horizontal nas telas críticas;
- textos que diferenciam dados insuficientes de desempenho ruim.

## Ajustes

- reset total permanece desabilitado até `RESETAR`;
- importação inválida exibe erro e não altera o banco;
- botões destrutivos compactos têm nome acessível;
- documentação e rótulos de entregas agora correspondem às rotas reais.

## Limites

O app mantém densidade alta em Dashboard e Configurações por reunir muitos domínios. Agrupamento, abas e disclosure evitam uma parede única de cards.
