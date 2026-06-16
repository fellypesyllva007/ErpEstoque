import assert from "node:assert/strict";
import test from "node:test";

import { tenantCreate, tenantWhere } from "../src/core/tenant.js";

test("tenantWhere aplica filtro obrigatório por empresa e filial", () => {
  assert.deepEqual(
    tenantWhere({ empresaId: "empresa-1", filialId: "filial-1", usuarioId: "user-1" }),
    { empresaId: "empresa-1", filialId: "filial-1" }
  );
});

test("tenantCreate injeta empresa e filial nos dados criados", () => {
  assert.deepEqual(
    { nome: "Produto A", ...tenantCreate({ empresaId: "empresa-2", filialId: "filial-3", usuarioId: "user-1" }) },
    { nome: "Produto A", empresaId: "empresa-2", filialId: "filial-3" }
  );
});
