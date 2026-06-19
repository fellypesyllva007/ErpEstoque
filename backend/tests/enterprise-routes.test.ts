import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("rotas SAP-like expõem controladoria, estoque enterprise, procurement, CRM, vendas e fiscal", () => {
  const financeiro = readFileSync(new URL("../src/modules/financeiro/financeiro.routes.ts", import.meta.url), "utf8");
  const estoque = readFileSync(new URL("../src/modules/estoque/estoque.routes.ts", import.meta.url), "utf8");
  const enterprise = readFileSync(new URL("../src/modules/enterprise/enterprise.routes.ts", import.meta.url), "utf8");

  for (const rota of ["/dre", "/fluxo-caixa", "/fechamento-mensal", "/conciliacao-bancaria", "/contabilidade/balancete", "/contabilidade/diario"]) {
    assert.match(financeiro, new RegExp(rota.replaceAll("/", "\\/")));
  }

  for (const rota of ["/produtos/:produtoId/kardex", "/reservas", "/inventarios", "/transferencias", "/lotes", "/series", "/bloqueios"]) {
    assert.match(estoque, new RegExp(rota.replaceAll("/", "\\/")));
  }

  for (const rota of ["/crm/leads", "/crm/oportunidades", "/crm/pipeline", "/compras/solicitacoes", "/compras/cotacoes", "/vendas/orcamentos", "/vendas/pedidos", "/vendas/tabelas-preco", "/fiscal/configuracoes-tributarias", "/workflow/regras", "/producao/listas-tecnicas", "/producao/ordens", "/producao/mrp", "/wms/enderecos", "/wms/tarefas", "/analytics/visoes"]) {
    assert.match(enterprise, new RegExp(rota.replaceAll("/", "\\/")));
  }
});


test("EnterpriseService usa modelos Prisma tipados em vez de SQL unsafe para processos SAP-like", () => {
  const service = readFileSync(new URL("../src/modules/enterprise/enterprise.service.ts", import.meta.url), "utf8");
  assert.doesNotMatch(service, /\$queryRawUnsafe/);
  for (const delegate of ["leadCrm", "oportunidadeCrm", "solicitacaoCompra", "orcamentoVenda", "pedidoVendaCorporativo", "eventoIntegracaoErp"]) {
    assert.match(service, new RegExp(delegate));
  }
});
