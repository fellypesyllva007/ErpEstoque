-- CreateTable
CREATE TABLE "movimentacoes_estoque" (
    "id" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "estoqueAnterior" INTEGER NOT NULL,
    "estoquePosterior" INTEGER NOT NULL,
    "observacao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimentacoes_estoque_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "movimentacoes_estoque_produtoId_idx" ON "movimentacoes_estoque"("produtoId");

-- CreateIndex
CREATE INDEX "movimentacoes_estoque_tipo_idx" ON "movimentacoes_estoque"("tipo");

-- CreateIndex
CREATE INDEX "movimentacoes_estoque_criadoEm_idx" ON "movimentacoes_estoque"("criadoEm");

-- AddForeignKey
ALTER TABLE "movimentacoes_estoque" ADD CONSTRAINT "movimentacoes_estoque_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
