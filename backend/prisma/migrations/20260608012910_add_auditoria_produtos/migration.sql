-- CreateTable
CREATE TABLE "auditoria_produtos" (
    "id" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "dadosAntes" JSONB,
    "dadosDepois" JSONB,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditoria_produtos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "auditoria_produtos_produtoId_idx" ON "auditoria_produtos"("produtoId");

-- CreateIndex
CREATE INDEX "auditoria_produtos_usuarioId_idx" ON "auditoria_produtos"("usuarioId");

-- CreateIndex
CREATE INDEX "auditoria_produtos_acao_idx" ON "auditoria_produtos"("acao");

-- AddForeignKey
ALTER TABLE "auditoria_produtos" ADD CONSTRAINT "auditoria_produtos_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria_produtos" ADD CONSTRAINT "auditoria_produtos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
