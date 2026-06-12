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
