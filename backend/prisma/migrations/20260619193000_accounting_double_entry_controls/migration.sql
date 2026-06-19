-- Fortalece o razão contábil para lançamentos automáticos em partida dobrada.
ALTER TABLE "lancamentos_contabeis"
  ADD CONSTRAINT "lancamentos_contabeis_conta_debito_fkey"
  FOREIGN KEY ("contaDebitoId") REFERENCES "plano_contas"("id") ON DELETE RESTRICT ON UPDATE CASCADE NOT VALID;

ALTER TABLE "lancamentos_contabeis"
  ADD CONSTRAINT "lancamentos_contabeis_conta_credito_fkey"
  FOREIGN KEY ("contaCreditoId") REFERENCES "plano_contas"("id") ON DELETE RESTRICT ON UPDATE CASCADE NOT VALID;

ALTER TABLE "lancamentos_contabeis"
  ADD CONSTRAINT "lancamentos_contabeis_partida_dobrada_chk"
  CHECK (
    "estornado" = true
    OR (
      "contaDebitoId" IS NOT NULL
      AND "contaCreditoId" IS NOT NULL
      AND "contaDebitoId" <> "contaCreditoId"
      AND "valor" > 0
    )
  ) NOT VALID;

CREATE INDEX IF NOT EXISTS "lancamentos_contabeis_contaDebitoId_idx" ON "lancamentos_contabeis"("contaDebitoId");
CREATE INDEX IF NOT EXISTS "lancamentos_contabeis_contaCreditoId_idx" ON "lancamentos_contabeis"("contaCreditoId");
CREATE UNIQUE INDEX IF NOT EXISTS "lancamentos_contabeis_origem_referencia_unique"
  ON "lancamentos_contabeis"("empresaId", "filialId", "origem", "referenciaId")
  WHERE "referenciaId" IS NOT NULL AND "estornado" = false;
