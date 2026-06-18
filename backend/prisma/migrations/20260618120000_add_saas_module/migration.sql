CREATE TABLE "saas_planos" (
  "id" TEXT NOT NULL,
  "codigo" TEXT NOT NULL,
  "nome" TEXT NOT NULL,
  "descricao" TEXT,
  "valorMensal" DECIMAL(12,2) NOT NULL,
  "limiteUsuarios" INTEGER NOT NULL DEFAULT 3,
  "limiteFiliais" INTEGER NOT NULL DEFAULT 1,
  "ativo" BOOLEAN NOT NULL DEFAULT true,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "saas_planos_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "saas_planos_codigo_key" ON "saas_planos"("codigo");
CREATE INDEX "saas_planos_ativo_idx" ON "saas_planos"("ativo");

CREATE TABLE "saas_assinaturas" (
  "id" TEXT NOT NULL,
  "empresaId" TEXT NOT NULL,
  "planoId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ATIVA',
  "valorMensal" DECIMAL(12,2) NOT NULL,
  "ciclo" TEXT NOT NULL DEFAULT 'MENSAL',
  "inicioEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "proximaCobrancaEm" TIMESTAMP(3) NOT NULL,
  "canceladaEm" TIMESTAMP(3),
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "saas_assinaturas_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "saas_assinaturas_empresaId_idx" ON "saas_assinaturas"("empresaId");
CREATE INDEX "saas_assinaturas_planoId_idx" ON "saas_assinaturas"("planoId");
CREATE INDEX "saas_assinaturas_status_idx" ON "saas_assinaturas"("status");
ALTER TABLE "saas_assinaturas" ADD CONSTRAINT "saas_assinaturas_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "saas_assinaturas" ADD CONSTRAINT "saas_assinaturas_planoId_fkey" FOREIGN KEY ("planoId") REFERENCES "saas_planos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO "saas_planos" ("id", "codigo", "nome", "descricao", "valorMensal", "limiteUsuarios", "limiteFiliais", "atualizadoEm")
VALUES
  (gen_random_uuid()::text, 'ESSENCIAL', 'Essencial', 'Plano inicial para pequenas assistências técnicas.', 69.90, 3, 1, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'PROFISSIONAL', 'Profissional', 'Mais usuários e filiais para operações em crescimento.', 129.90, 8, 2, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'EMPRESARIAL', 'Empresarial', 'Operação multiunidade com maior limite de usuários.', 249.90, 20, 5, CURRENT_TIMESTAMP);
