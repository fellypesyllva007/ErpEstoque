# KoreERP Enterprise Phase 4

Objetivo: evoluir o KoreERP para o próximo estágio SAP-like, mantendo a base já entregue de multiempresa, multifilial, financeiro base, fiscal, estoque, compras, vendas, OS, autenticação, RBAC e Flutter multiplataforma.

## Estado de partida

O projeto já possui:

- Backend Node.js, Express, TypeScript, Prisma e PostgreSQL.
- Frontend Flutter multiplataforma.
- Multiempresa e multifilial com contexto de tenant.
- Módulos de estoque, compras, vendas, OS, clientes, fornecedores e produtos.
- Financeiro base com contas a pagar, contas a receber e caixa.
- Fiscal com estrutura de NF-e/NFC-e via gateway.
- RBAC, auditoria e seed demonstrativa.

## Objetivo da fase

A Phase 4 deve elevar o KoreERP de ERP operacional multiempresa para ERP empresarial avançado, com foco em:

1. Financeiro gerencial avançado.
2. Estoque enterprise.
3. Compras com aprovação e cotações.
4. Vendas corporativas com pipeline completo.
5. CRM inicial.
6. BI e dashboards executivos.
7. Flutter mais robusto e responsivo.
8. Testes de integração e isolamento multiempresa.

## Regras obrigatórias

- Não criar telas vazias.
- Não adicionar TODO crítico sem implementação.
- Não remover funcionalidades existentes.
- Não quebrar build do backend.
- Não quebrar Flutter analyze.
- Nenhuma consulta operacional pode ignorar empresaId/filialId.
- Nenhum módulo novo pode existir apenas no backend ou apenas no frontend.
- Toda operação sensível deve registrar auditoria.
- Toda operação financeira ou de estoque deve ser transacional.
