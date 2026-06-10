-- Compras
CREATE TABLE "pedidos_compra" (
    "id" TEXT NOT NULL, "numero" TEXT NOT NULL, "fornecedorId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RASCUNHO', "observacoes" TEXT,
    "valorTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "pedidos_compra_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "pedidos_compra_numero_key" ON "pedidos_compra"("numero");
CREATE INDEX "pedidos_compra_fornecedorId_idx" ON "pedidos_compra"("fornecedorId");
CREATE INDEX "pedidos_compra_status_idx" ON "pedidos_compra"("status");
ALTER TABLE "pedidos_compra" ADD CONSTRAINT "pedidos_compra_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "fornecedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "itens_pedido_compra" (
    "id" TEXT NOT NULL, "pedidoId" TEXT NOT NULL, "produtoId" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL, "qtdRecebida" INTEGER NOT NULL DEFAULT 0,
    "custoUnitario" DECIMAL(12,2) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "itens_pedido_compra_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "itens_pedido_compra_pedidoId_idx" ON "itens_pedido_compra"("pedidoId");
ALTER TABLE "itens_pedido_compra" ADD CONSTRAINT "itens_pedido_compra_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos_compra"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "itens_pedido_compra" ADD CONSTRAINT "itens_pedido_compra_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "recebimentos_compra" (
    "id" TEXT NOT NULL, "pedidoId" TEXT NOT NULL, "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "recebimentos_compra_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "recebimentos_compra_pedidoId_idx" ON "recebimentos_compra"("pedidoId");
ALTER TABLE "recebimentos_compra" ADD CONSTRAINT "recebimentos_compra_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos_compra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "itens_recebimento" (
    "id" TEXT NOT NULL, "recebimentoId" TEXT NOT NULL, "produtoId" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "itens_recebimento_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "itens_recebimento_recebimentoId_idx" ON "itens_recebimento"("recebimentoId");
ALTER TABLE "itens_recebimento" ADD CONSTRAINT "itens_recebimento_recebimentoId_fkey" FOREIGN KEY ("recebimentoId") REFERENCES "recebimentos_compra"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "itens_recebimento" ADD CONSTRAINT "itens_recebimento_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Vendas
CREATE TABLE "vendas" (
    "id" TEXT NOT NULL, "numero" TEXT NOT NULL, "clienteId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ABERTA', "formaPagamento" TEXT,
    "desconto" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "valorTotal" DECIMAL(12,2) NOT NULL DEFAULT 0, "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "vendas_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "vendas_numero_key" ON "vendas"("numero");
CREATE INDEX "vendas_clienteId_idx" ON "vendas"("clienteId");
CREATE INDEX "vendas_status_idx" ON "vendas"("status");
CREATE INDEX "vendas_criadoEm_idx" ON "vendas"("criadoEm");
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "itens_venda" (
    "id" TEXT NOT NULL, "vendaId" TEXT NOT NULL, "produtoId" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL, "precoUnitario" DECIMAL(12,2) NOT NULL,
    "desconto" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "itens_venda_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "itens_venda_vendaId_idx" ON "itens_venda"("vendaId");
ALTER TABLE "itens_venda" ADD CONSTRAINT "itens_venda_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "vendas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "itens_venda" ADD CONSTRAINT "itens_venda_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- OS Itens + campos extras
CREATE TABLE "itens_os" (
    "id" TEXT NOT NULL, "ordemId" TEXT NOT NULL, "produtoId" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL, "precoUnitario" DECIMAL(12,2) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "itens_os_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "itens_os_ordemId_idx" ON "itens_os"("ordemId");
ALTER TABLE "itens_os" ADD CONSTRAINT "itens_os_ordemId_fkey" FOREIGN KEY ("ordemId") REFERENCES "ordens_servico"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "itens_os" ADD CONSTRAINT "itens_os_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ordens_servico" ADD COLUMN IF NOT EXISTS "garantiaDias" INTEGER DEFAULT 90;
ALTER TABLE "ordens_servico" ADD COLUMN IF NOT EXISTS "valorMaoObra" DECIMAL(12,2);
ALTER TABLE "clientes" ADD COLUMN IF NOT EXISTS "vendasCount" INTEGER DEFAULT 0;

-- Auditoria Geral
CREATE TABLE "auditoria_geral" (
    "id" TEXT NOT NULL, "usuarioId" TEXT, "tabela" TEXT NOT NULL,
    "registro" TEXT NOT NULL, "acao" TEXT NOT NULL,
    "dadosAntes" JSONB, "dadosDepois" JSONB, "ip" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "auditoria_geral_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "auditoria_geral_tabela_idx" ON "auditoria_geral"("tabela");
CREATE INDEX "auditoria_geral_usuarioId_idx" ON "auditoria_geral"("usuarioId");
CREATE INDEX "auditoria_geral_criadoEm_idx" ON "auditoria_geral"("criadoEm");
ALTER TABLE "auditoria_geral" ADD CONSTRAINT "auditoria_geral_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
