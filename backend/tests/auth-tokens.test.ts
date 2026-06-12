import assert from "node:assert/strict";
import test from "node:test";
import jwt from "jsonwebtoken";

import { criarRefreshToken, gerarAccessToken } from "../src/core/auth-tokens.js";

test("login gera access token com identidade e perfil do usuário", () => {
  const token = gerarAccessToken(
    { id: "user-1", usuario: "admin", perfil: "Administrador" },
    "segredo-de-teste",
    "1h"
  );

  const payload = jwt.verify(token, "segredo-de-teste") as jwt.JwtPayload;
  assert.equal(payload.sub, "user-1");
  assert.equal(payload.usuario, "admin");
  assert.equal(payload.perfil, "Administrador");
});

test("refresh token é opaco e expira em 30 dias", () => {
  const agora = new Date("2026-06-12T00:00:00.000Z");
  const refresh = criarRefreshToken(agora);

  assert.match(refresh.token, /^[0-9a-f-]{36}$/i);
  assert.equal(refresh.expiraEm.toISOString(), "2026-07-12T00:00:00.000Z");
});
