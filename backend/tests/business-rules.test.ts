import assert from "node:assert/strict";
import test from "node:test";

import {
  assertEstoqueDisponivel,
  calcularEstoquePosterior,
  calcularStatusPedidoCompra,
  calcularSugestaoReposicaoProduto,
  calcularTotalVenda,
  deveExibirSugestaoReposicao,
  montarCodigoPermissao,
  consolidarDreGerencial,
  calcularSaldoDisponivel,
  assertPeriodoFinanceiroAberto,
  calcularAgingContas,
} from "../src/core/business-rules.js";

test("venda calcula total com desconto por item e desconto global", () => {
  const total = calcularTotalVenda(
    [
      { quantidade: 2, precoUnitario: 100, desconto: 10 },
      { quantidade: 1, precoUnitario: 50 },
    ],
    15
  );

  assert.equal(total, 225);
});

test("baixa de venda e estorno atualizam estoque na direção correta", () => {
  assert.equal(calcularEstoquePosterior(10, 3, "SAIDA"), 7);
  assert.equal(calcularEstoquePosterior(7, 3, "ENTRADA"), 10);
});

test("estoque insuficiente bloqueia venda ou uso de peça em OS", () => {
  assert.doesNotThrow(() =>
    assertEstoqueDisponivel({ nome: "Tela", estoqueAtual: 2 }, 2)
  );

  assert.throws(
    () => assertEstoqueDisponivel({ nome: "Tela", estoqueAtual: 1 }, 2),
    /Estoque insuficiente/
  );
});

test("recebimento de compra resolve status do pedido", () => {
  assert.equal(
    calcularStatusPedidoCompra([
      { quantidade: 5, qtdRecebida: 0 },
      { quantidade: 2, qtdRecebida: 0 },
    ]),
    "ENVIADO"
  );
  assert.equal(
    calcularStatusPedidoCompra([
      { quantidade: 5, qtdRecebida: 3 },
      { quantidade: 2, qtdRecebida: 0 },
    ]),
    "PARCIAL"
  );
  assert.equal(
    calcularStatusPedidoCompra([
      { quantidade: 5, qtdRecebida: 5 },
      { quantidade: 2, qtdRecebida: 2 },
    ]),
    "RECEBIDO"
  );
});

test("relatório de reposição calcula criticidade e sugestão", () => {
  const sugestao = calcularSugestaoReposicaoProduto(
    {
      id: "p1",
      nome: "Bateria",
      codigoInterno: "BAT-1",
      estoqueAtual: 3,
      estoqueMinimo: 5,
      fornecedor: { nome: "Fornecedor A" },
    },
    30
  );

  assert.equal(sugestao.consumoDiario, 1);
  assert.equal(sugestao.coberturaDias, 3);
  assert.equal(sugestao.sugestaoCompra, 7);
  assert.equal(sugestao.criticidade, "CRITICO");
  assert.equal(deveExibirSugestaoReposicao(sugestao), true);
});

test("RBAC monta código de permissão compatível com middleware", () => {
  assert.equal(
    montarCodigoPermissao("produtos", "produtos_tela", "editar"),
    "produtos.produtos_tela.editar"
  );
});


test("DRE gerencial consolida receitas, despesas e categorias", () => {
  const dre = consolidarDreGerencial([
    { tipo: "RECEITA", categoria: "Vendas", valor: 1000 },
    { tipo: "DESPESA", categoria: "CMV", valor: 350 },
    { tipo: "DESPESA", categoria: "Administrativo", valor: 150 },
  ]);

  assert.equal(dre.receitas, 1000);
  assert.equal(dre.despesas, 500);
  assert.equal(dre.resultado, 500);
  assert.equal(dre.detalhes.length, 3);
});

test("estoque enterprise diferencia físico, reservado, bloqueado e disponível", () => {
  assert.deepEqual(calcularSaldoDisponivel(10, 3, 2), {
    estoqueFisico: 10,
    reservado: 3,
    bloqueado: 2,
    disponivel: 5,
  });
});

test("fechamento mensal bloqueia operações financeiras sensíveis", () => {
  assert.doesNotThrow(() => assertPeriodoFinanceiroAberto("ABERTO"));
  assert.throws(() => assertPeriodoFinanceiroAberto("FECHADO"), /fechado/i);
});

test("aging financeiro separa vencidas e a vencer", () => {
  const aging = calcularAgingContas([
    { vencimento: new Date("2026-06-20"), valor: 100, valorBaixado: 0 },
    { vencimento: new Date("2026-06-01"), valor: 200, valorBaixado: 50 },
    { vencimento: new Date("2026-03-01"), valor: 300, valorBaixado: 0 },
  ], new Date("2026-06-19"));

  assert.equal(aging.aVencer, 100);
  assert.equal(aging.vencido1a30, 150);
  assert.equal(aging.vencidoMais90, 300);
});
