-- CreateTable
CREATE TABLE "modelos_aparelho" (
    "id" TEXT NOT NULL,
    "fabricante" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "variante" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "modelos_aparelho_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produto_modelos" (
    "produtoId" TEXT NOT NULL,
    "modeloId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "produto_modelos_pkey" PRIMARY KEY ("produtoId","modeloId")
);

-- CreateIndex
CREATE INDEX "modelos_aparelho_fabricante_idx" ON "modelos_aparelho"("fabricante");

-- CreateIndex
CREATE INDEX "modelos_aparelho_nome_idx" ON "modelos_aparelho"("nome");

-- CreateIndex
CREATE INDEX "produto_modelos_produtoId_idx" ON "produto_modelos"("produtoId");

-- CreateIndex
CREATE INDEX "produto_modelos_modeloId_idx" ON "produto_modelos"("modeloId");

-- AddForeignKey
ALTER TABLE "produto_modelos" ADD CONSTRAINT "produto_modelos_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produto_modelos" ADD CONSTRAINT "produto_modelos_modeloId_fkey" FOREIGN KEY ("modeloId") REFERENCES "modelos_aparelho"("id") ON DELETE CASCADE ON UPDATE CASCADE;
