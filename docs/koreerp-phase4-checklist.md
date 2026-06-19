# KoreERP Phase 4 Delivery Checklist

Use este checklist para acompanhar a evolução do PR #4.

## 1. Financeiro avançado

- [x] Criar serviços de DRE gerencial.
- [x] Criar endpoint de DRE por período.
- [x] Criar fluxo de caixa realizado.
- [x] Criar fluxo de caixa projetado.
- [x] Criar conciliação bancária simples.
- [x] Criar fechamento financeiro mensal.
- [ ] Criar telas Flutter para DRE e fluxo de caixa.
- [x] Criar testes de DRE, fluxo de caixa e contratos de rotas.

## 2. Estoque enterprise

- [x] Criar inventário geral.
- [x] Criar inventário cíclico.
- [x] Criar kardex por produto.
- [x] Criar reserva de estoque.
- [x] Criar transferência entre filiais com confirmação.
- [x] Criar suporte a lote e número de série.
- [ ] Criar telas Flutter de inventário e kardex.
- [x] Criar testes de movimentação, transferência e rotas de rastreabilidade.

## 3. Compras enterprise

- [x] Criar solicitação de compra.
- [x] Criar workflow de aprovação.
- [x] Criar cotação com múltiplos fornecedores.
- [x] Criar comparativo de cotações.
- [x] Criar pedido a partir de cotação vencedora.
- [ ] Integrar recebimento com estoque e financeiro.
- [ ] Criar telas Flutter de solicitação, cotação e aprovação.
- [ ] Criar testes de aprovação e recebimento.

## 4. Vendas corporativas

- [x] Criar orçamento.
- [x] Criar pedido de venda.
- [ ] Criar reserva de estoque no pedido.
- [x] Criar faturamento do pedido.
- [ ] Criar devolução de venda.
- [x] Criar tabela de preço.
- [ ] Criar comissão de vendedor.
- [ ] Criar telas Flutter de orçamento, pedido e faturamento.
- [ ] Criar testes de orçamento, faturamento e devolução.

## 5. CRM inicial

- [x] Criar modelo de lead.
- [x] Criar modelo de oportunidade.
- [x] Criar funil de vendas.
- [x] Criar atividades comerciais.
- [ ] Permitir converter lead em cliente.
- [x] Permitir converter oportunidade em orçamento.
- [x] Criar telas Flutter de CRM.
- [ ] Criar testes de conversão.

## 6. BI e dashboards

- [x] Criar indicadores financeiros.
- [x] Criar indicadores comerciais.
- [x] Criar indicadores de estoque.
- [x] Criar indicadores de OS.
- [x] Criar dashboard executivo Flutter.
- [x] Garantir filtros por empresa, filial e período.

## 7. Qualidade

- [x] npm test passando.
- [x] npm run build passando.
- [ ] flutter analyze passando.
- [ ] flutter build web passando.
- [x] README atualizado.
- [ ] Seed demonstrativa atualizada.
- [ ] Testes de isolamento multiempresa passando.

## Definição de pronto

A Phase 4 passa a ter núcleo SAP-like funcional para controladoria, estoque enterprise, procurement, vendas corporativas, CRM, BI e fiscal, mantendo pendências evolutivas de E2E/build Flutter em ambiente de CI.