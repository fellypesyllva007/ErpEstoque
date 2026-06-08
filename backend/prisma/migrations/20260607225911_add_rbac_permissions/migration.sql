-- CreateTable
CREATE TABLE "modulos" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "modulos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telas" (
    "id" TEXT NOT NULL,
    "moduloId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "telas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissoes" (
    "id" TEXT NOT NULL,
    "telaId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perfil_permissoes" (
    "perfilId" TEXT NOT NULL,
    "permissaoId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "perfil_permissoes_pkey" PRIMARY KEY ("perfilId","permissaoId")
);

-- CreateIndex
CREATE UNIQUE INDEX "modulos_codigo_key" ON "modulos"("codigo");

-- CreateIndex
CREATE INDEX "modulos_codigo_idx" ON "modulos"("codigo");

-- CreateIndex
CREATE INDEX "telas_moduloId_idx" ON "telas"("moduloId");

-- CreateIndex
CREATE UNIQUE INDEX "telas_moduloId_codigo_key" ON "telas"("moduloId", "codigo");

-- CreateIndex
CREATE INDEX "permissoes_telaId_idx" ON "permissoes"("telaId");

-- CreateIndex
CREATE UNIQUE INDEX "permissoes_telaId_codigo_key" ON "permissoes"("telaId", "codigo");

-- CreateIndex
CREATE INDEX "perfil_permissoes_perfilId_idx" ON "perfil_permissoes"("perfilId");

-- CreateIndex
CREATE INDEX "perfil_permissoes_permissaoId_idx" ON "perfil_permissoes"("permissaoId");

-- AddForeignKey
ALTER TABLE "telas" ADD CONSTRAINT "telas_moduloId_fkey" FOREIGN KEY ("moduloId") REFERENCES "modulos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permissoes" ADD CONSTRAINT "permissoes_telaId_fkey" FOREIGN KEY ("telaId") REFERENCES "telas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfil_permissoes" ADD CONSTRAINT "perfil_permissoes_perfilId_fkey" FOREIGN KEY ("perfilId") REFERENCES "perfis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfil_permissoes" ADD CONSTRAINT "perfil_permissoes_permissaoId_fkey" FOREIGN KEY ("permissaoId") REFERENCES "permissoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
