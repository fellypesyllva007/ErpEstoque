-- CreateTable
CREATE TABLE "marcas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marcas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produtos" (
    "id" TEXT NOT NULL,
    "codigoInterno" TEXT NOT NULL,
    "codigoFornecedor" TEXT,
    "nome" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "fornecedorId" TEXT,
    "custo" DECIMAL(12,2) NOT NULL,
    "precoVenda" DECIMAL(12,2) NOT NULL,
    "estoqueAtual" INTEGER NOT NULL DEFAULT 0,
    "estoqueMinimo" INTEGER NOT NULL DEFAULT 0,
    "localizacaoFisica" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "marcas_nome_key" ON "marcas"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "produtos_codigoInterno_key" ON "produtos"("codigoInterno");

-- CreateIndex
CREATE INDEX "produtos_nome_idx" ON "produtos"("nome");

-- CreateIndex
CREATE INDEX "produtos_categoriaId_idx" ON "produtos"("categoriaId");

-- CreateIndex
CREATE INDEX "produtos_marcaId_idx" ON "produtos"("marcaId");

-- CreateIndex
CREATE INDEX "produtos_fornecedorId_idx" ON "produtos"("fornecedorId");

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias_produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "marcas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "fornecedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;
