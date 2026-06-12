# Auditoria de acessibilidade

## Cobertura

- um `h1` por tela principal;
- navegações com nomes acessíveis;
- tabs, dialogs e formulários operáveis por teclado;
- mensagens de erro com `role="alert"` quando necessário;
- timer com atualizações em região `aria-live`;
- botões icon-only com `aria-label`;
- foco visível e preferência de redução de movimento;
- menu mobile em dialog acessível.

## Correção aplicada

Os botões de reset por módulo receberam nomes como `Resetar Notas`, evitando controles sem descrição para leitores de tela.

## Risco residual

Contraste final depende da combinação entre tema e configurações do navegador. A auditoria automatizada complementa, mas não substitui, teste manual com leitor de tela.
