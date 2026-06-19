import assert from "node:assert/strict";
import test from "node:test";

import { avaliarAcessoAssinatura, assertAssinaturaOperacional, proximaCobrancaVencida } from "../src/modules/saas/saas.rules.js";

const agora = new Date("2026-06-19T12:00:00.000Z");

test("bloqueia empresas sem assinatura SaaS", () => {
  const acesso = avaliarAcessoAssinatura(null, agora);

  assert.equal(acesso.permitido, false);
  assert.equal(acesso.statusHttp, 402);
  assert.equal(acesso.codigo, "ASSINATURA_INEXISTENTE");
});

test("bloqueia assinatura ativa quando proximaCobrancaEm está vencida", () => {
  const acesso = avaliarAcessoAssinatura({ status: "ATIVA", proximaCobrancaEm: "2026-06-18T23:59:59.000Z" }, agora);

  assert.equal(acesso.permitido, false);
  assert.equal(acesso.codigo, "ASSINATURA_VENCIDA");
});

test("permite assinatura ativa com próxima cobrança futura", () => {
  const acesso = avaliarAcessoAssinatura({ status: "ATIVA", proximaCobrancaEm: "2026-06-20T00:00:00.000Z" }, agora);

  assert.equal(acesso.permitido, true);
  assert.equal(acesso.codigo, "ASSINATURA_OK");
});

test("assertAssinaturaOperacional falha para assinatura suspensa", () => {
  assert.throws(
    () => assertAssinaturaOperacional({ status: "SUSPENSA", proximaCobrancaEm: "2026-06-20T00:00:00.000Z" }, agora),
    /Regularize a assinatura/
  );
});

test("proximaCobrancaVencida compara datas Date ou string", () => {
  assert.equal(proximaCobrancaVencida(new Date("2026-06-18T12:00:00.000Z"), agora), true);
  assert.equal(proximaCobrancaVencida("2026-06-19T12:00:01.000Z", agora), false);
});
