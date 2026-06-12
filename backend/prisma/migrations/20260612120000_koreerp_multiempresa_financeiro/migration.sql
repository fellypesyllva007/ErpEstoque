-- KoreERP multiempresa, cadastros base e financeiro gerencial.
ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "empresaId" TEXT, ADD COLUMN IF NOT EXISTS "filialId" TEXT, ADD COLUMN IF NOT EXISTS "senhaTemporaria" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE "perfis" ADD COLUMN IF NOT EXISTS "empresaId" TEXT, ADD COLUMN IF NOT EXISTS "filialId" TEXT;
ALTER TABLE "categorias_produto" ADD COLUMN IF NOT EXISTS "empresaId" TEXT, ADD COLUMN IF NOT EXISTS "filialId" TEXT;
ALTER TABLE "marcas" ADD COLUMN IF NOT EXISTS "empresaId" TEXT, ADD COLUMN IF NOT EXISTS "filialId" TEXT;
ALTER TABLE "fornecedores" ADD COLUMN IF NOT EXISTS "empresaId" TEXT, ADD COLUMN IF NOT EXISTS "filialId" TEXT;
ALTER TABLE "produtos" ADD COLUMN IF NOT EXISTS "empresaId" TEXT, ADD COLUMN IF NOT EXISTS "filialId" TEXT;
ALTER TABLE "movimentacoes_estoque" ADD COLUMN IF NOT EXISTS "empresaId" TEXT, ADD COLUMN IF NOT EXISTS "filialId" TEXT;
ALTER TABLE "auditoria_produtos" ADD COLUMN IF NOT EXISTS "empresaId" TEXT, ADD COLUMN IF NOT EXISTS "filialId" TEXT;
ALTER TABLE "clientes" ADD COLUMN IF NOT EXISTS "empresaId" TEXT, ADD COLUMN IF NOT EXISTS "filialId" TEXT;
ALTER TABLE "ordens_servico" ADD COLUMN IF NOT EXISTS "empresaId" TEXT, ADD COLUMN IF NOT EXISTS "filialId" TEXT;
ALTER TABLE "pedidos_compra" ADD COLUMN IF NOT EXISTS "empresaId" TEXT, ADD COLUMN IF NOT EXISTS "filialId" TEXT;
ALTER TABLE "recebimentos_compra" ADD COLUMN IF NOT EXISTS "empresaId" TEXT, ADD COLUMN IF NOT EXISTS "filialId" TEXT;
ALTER TABLE "vendas" ADD COLUMN IF NOT EXISTS "empresaId" TEXT, ADD COLUMN IF NOT EXISTS "filialId" TEXT;
ALTER TABLE "auditoria_geral" ADD COLUMN IF NOT EXISTS "empresaId" TEXT, ADD COLUMN IF NOT EXISTS "filialId" TEXT;
ALTER TABLE "naturezas_operacao" ADD COLUMN IF NOT EXISTS "empresaId" TEXT, ADD COLUMN IF NOT EXISTS "filialId" TEXT;
ALTER TABLE "regras_tributarias" ADD COLUMN IF NOT EXISTS "empresaId" TEXT, ADD COLUMN IF NOT EXISTS "filialId" TEXT;

CREATE TABLE IF NOT EXISTS "usuarios_filiais" (
  "id" TEXT PRIMARY KEY, "usuarioId" TEXT NOT NULL, "empresaId" TEXT NOT NULL, "filialId" TEXT NOT NULL,
  "ativo" BOOLEAN NOT NULL DEFAULT TRUE, "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "usuarios_filiais_usuarioId_empresaId_filialId_key" ON "usuarios_filiais"("usuarioId","empresaId","filialId");
CREATE INDEX IF NOT EXISTS "usuarios_filiais_usuarioId_idx" ON "usuarios_filiais"("usuarioId");
CREATE INDEX IF NOT EXISTS "usuarios_filiais_empresaId_idx" ON "usuarios_filiais"("empresaId");
CREATE INDEX IF NOT EXISTS "usuarios_filiais_filialId_idx" ON "usuarios_filiais"("filialId");

CREATE TABLE IF NOT EXISTS "unidades_medida" ("empresaId" TEXT, "filialId" TEXT, "id" TEXT PRIMARY KEY, "sigla" TEXT NOT NULL, "descricao" TEXT NOT NULL, "ativo" BOOLEAN NOT NULL DEFAULT TRUE, "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE UNIQUE INDEX IF NOT EXISTS "unidades_medida_empresaId_sigla_key" ON "unidades_medida"("empresaId","sigla");
CREATE TABLE IF NOT EXISTS "condicoes_pagamento" ("empresaId" TEXT, "filialId" TEXT, "id" TEXT PRIMARY KEY, "nome" TEXT NOT NULL, "parcelas" INTEGER NOT NULL DEFAULT 1, "intervaloDias" INTEGER NOT NULL DEFAULT 30, "ativo" BOOLEAN NOT NULL DEFAULT TRUE, "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE UNIQUE INDEX IF NOT EXISTS "condicoes_pagamento_empresaId_nome_key" ON "condicoes_pagamento"("empresaId","nome");
CREATE TABLE IF NOT EXISTS "formas_pagamento" ("empresaId" TEXT, "filialId" TEXT, "id" TEXT PRIMARY KEY, "nome" TEXT NOT NULL, "tipo" TEXT NOT NULL, "ativo" BOOLEAN NOT NULL DEFAULT TRUE, "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE UNIQUE INDEX IF NOT EXISTS "formas_pagamento_empresaId_nome_key" ON "formas_pagamento"("empresaId","nome");
CREATE TABLE IF NOT EXISTS "centros_custo" ("empresaId" TEXT, "filialId" TEXT, "id" TEXT PRIMARY KEY, "codigo" TEXT NOT NULL, "nome" TEXT NOT NULL, "ativo" BOOLEAN NOT NULL DEFAULT TRUE, "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE UNIQUE INDEX IF NOT EXISTS "centros_custo_empresaId_codigo_key" ON "centros_custo"("empresaId","codigo");
CREATE TABLE IF NOT EXISTS "plano_contas" ("empresaId" TEXT, "filialId" TEXT, "id" TEXT PRIMARY KEY, "codigo" TEXT NOT NULL, "nome" TEXT NOT NULL, "tipo" TEXT NOT NULL, "ativo" BOOLEAN NOT NULL DEFAULT TRUE, "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE UNIQUE INDEX IF NOT EXISTS "plano_contas_empresaId_codigo_key" ON "plano_contas"("empresaId","codigo");
CREATE TABLE IF NOT EXISTS "contas_receber" ("empresaId" TEXT, "filialId" TEXT, "id" TEXT PRIMARY KEY, "clienteId" TEXT, "vendaId" TEXT, "descricao" TEXT NOT NULL, "valor" DECIMAL(12,2) NOT NULL, "valorBaixado" DECIMAL(12,2) NOT NULL DEFAULT 0, "vencimento" TIMESTAMP(3) NOT NULL, "status" TEXT NOT NULL DEFAULT 'ABERTO', "centroCustoId" TEXT, "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS "contas_pagar" ("empresaId" TEXT, "filialId" TEXT, "id" TEXT PRIMARY KEY, "fornecedorId" TEXT, "compraId" TEXT, "descricao" TEXT NOT NULL, "valor" DECIMAL(12,2) NOT NULL, "valorBaixado" DECIMAL(12,2) NOT NULL DEFAULT 0, "vencimento" TIMESTAMP(3) NOT NULL, "status" TEXT NOT NULL DEFAULT 'ABERTO', "centroCustoId" TEXT, "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS "movimentos_caixa" ("empresaId" TEXT, "filialId" TEXT, "id" TEXT PRIMARY KEY, "tipo" TEXT NOT NULL, "origem" TEXT NOT NULL, "referenciaId" TEXT, "descricao" TEXT NOT NULL, "valor" DECIMAL(12,2) NOT NULL, "dataMovimento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "estornado" BOOLEAN NOT NULL DEFAULT FALSE, "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS "unidades_medida_empresaId_idx" ON "unidades_medida"("empresaId");
CREATE INDEX IF NOT EXISTS "unidades_medida_filialId_idx" ON "unidades_medida"("filialId");
CREATE INDEX IF NOT EXISTS "condicoes_pagamento_empresaId_idx" ON "condicoes_pagamento"("empresaId");
CREATE INDEX IF NOT EXISTS "condicoes_pagamento_filialId_idx" ON "condicoes_pagamento"("filialId");
CREATE INDEX IF NOT EXISTS "formas_pagamento_empresaId_idx" ON "formas_pagamento"("empresaId");
CREATE INDEX IF NOT EXISTS "formas_pagamento_filialId_idx" ON "formas_pagamento"("filialId");
CREATE INDEX IF NOT EXISTS "centros_custo_empresaId_idx" ON "centros_custo"("empresaId");
CREATE INDEX IF NOT EXISTS "centros_custo_filialId_idx" ON "centros_custo"("filialId");
CREATE INDEX IF NOT EXISTS "plano_contas_empresaId_idx" ON "plano_contas"("empresaId");
CREATE INDEX IF NOT EXISTS "plano_contas_filialId_idx" ON "plano_contas"("filialId");
CREATE INDEX IF NOT EXISTS "contas_receber_empresaId_idx" ON "contas_receber"("empresaId");
CREATE INDEX IF NOT EXISTS "contas_receber_filialId_idx" ON "contas_receber"("filialId");
CREATE INDEX IF NOT EXISTS "contas_receber_status_idx" ON "contas_receber"("status");
CREATE INDEX IF NOT EXISTS "contas_receber_vencimento_idx" ON "contas_receber"("vencimento");
CREATE INDEX IF NOT EXISTS "contas_pagar_empresaId_idx" ON "contas_pagar"("empresaId");
CREATE INDEX IF NOT EXISTS "contas_pagar_filialId_idx" ON "contas_pagar"("filialId");
CREATE INDEX IF NOT EXISTS "contas_pagar_status_idx" ON "contas_pagar"("status");
CREATE INDEX IF NOT EXISTS "contas_pagar_vencimento_idx" ON "contas_pagar"("vencimento");
CREATE INDEX IF NOT EXISTS "movimentos_caixa_empresaId_idx" ON "movimentos_caixa"("empresaId");
CREATE INDEX IF NOT EXISTS "movimentos_caixa_filialId_idx" ON "movimentos_caixa"("filialId");
CREATE INDEX IF NOT EXISTS "movimentos_caixa_tipo_idx" ON "movimentos_caixa"("tipo");
CREATE INDEX IF NOT EXISTS "movimentos_caixa_dataMovimento_idx" ON "movimentos_caixa"("dataMovimento");
