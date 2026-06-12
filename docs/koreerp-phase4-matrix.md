# KoreERP Phase 4 Implementation Matrix

Esta matriz organiza os módulos que devem ser implantados na Phase 4.

## Financeiro avançado

Entregas:

- DRE gerencial por período, empresa e filial.
- Fluxo de caixa realizado e projetado.
- Categorias financeiras vinculadas ao plano de contas.
- Rateio por centro de custo.
- Conciliação bancária simples.
- Fechamento financeiro mensal.
- Relatórios de inadimplência.
- Relatórios de contas vencidas e a vencer.

Critérios de aceite:

- Venda gera conta a receber corretamente.
- Compra gera conta a pagar corretamente.
- Baixas alteram caixa ou banco.
- Estornos revertem caixa ou banco sem duplicidade.
- DRE considera receitas, custos e despesas por período.
- Fluxo projetado considera vencimentos futuros.
- Todas as consultas usam contexto de empresa e filial.

## Estoque enterprise

Entregas:

- Inventário geral e inventário cíclico.
- Divergência de inventário com aprovação.
- Lote e número de série quando configurado no produto.
- Endereçamento físico simples.
- Transferência entre filiais com saída pendente e entrada confirmada.
- Reserva de estoque para pedido de venda e OS.
- Kardex por produto.

Critérios de aceite:

- Ajuste de estoque exige motivo.
- Transferência não cria saldo negativo sem permissão.
- Produto serializado exige serial na entrada e saída.
- Inventário gera movimentações auditadas.
- Kardex mostra histórico completo por produto e filial.

## Compras enterprise

Entregas:

- Solicitação de compra.
- Workflow de aprovação por alçada.
- Cotação com múltiplos fornecedores.
- Comparativo de cotações.
- Pedido de compra originado da cotação vencedora.
- Recebimento parcial ou total.
- Devolução ao fornecedor.
- Integração com estoque e financeiro.

Critérios de aceite:

- Solicitação não vira pedido sem aprovação quando houver regra ativa.
- Pedido aprovado gera previsão financeira.
- Recebimento alimenta estoque.
- Cancelamento ou estorno não deixa financeiro ou estoque inconsistentes.

## Vendas corporativas

Entregas:

- Orçamento.
- Pedido de venda.
- Separação e reserva de estoque.
- Faturamento.
- Devolução de venda.
- Política de desconto por perfil e permissão.
- Tabelas de preço por empresa e filial.
- Comissão de vendedor.

Critérios de aceite:

- Orçamento aprovado pode virar pedido.
- Pedido pode reservar estoque.
- Faturamento gera financeiro e fiscal quando configurado.
- Desconto acima da alçada exige permissão.
- Devolução estorna estoque e financeiro corretamente.

## CRM inicial

Entregas:

- Leads.
- Oportunidades.
- Funil de vendas.
- Atividades comerciais.
- Conversão de oportunidade em orçamento.
- Histórico de relacionamento por cliente.

Critérios de aceite:

- Lead pode virar cliente.
- Oportunidade pode virar orçamento.
- Atividades aparecem no histórico do cliente.
- Dados são isolados por empresa e filial.
