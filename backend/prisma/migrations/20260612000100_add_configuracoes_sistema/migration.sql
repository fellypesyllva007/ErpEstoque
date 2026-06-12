-- CreateTable
CREATE TABLE "configuracoes_sistema" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT,
    "cnpj" TEXT,
    "nomeEmpresa" TEXT,
    "instalacaoId" TEXT,
    "hardwareFingerprint" TEXT,
    "versaoSistema" TEXT,
    "licencaStatus" TEXT,
    "licencaPlano" TEXT,
    "licencaEmitidaEm" TIMESTAMP(3),
    "licencaExpiraEm" TIMESTAMP(3),
    "ultimaValidacaoLicenca" TIMESTAMP(3),
    "proximaValidacaoLicenca" TIMESTAMP(3),
    "ultimaSincronizacaoApi" TIMESTAMP(3),
    "activationHash" TEXT,
    "licencaArquivoHash" TEXT,
    "licencaArquivoRecebidoEm" TIMESTAMP(3),
    "nonceLicenca" INTEGER,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracoes_sistema_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "configuracoes_sistema_instalacaoId_key" ON "configuracoes_sistema"("instalacaoId");

-- CreateIndex
CREATE INDEX "configuracoes_sistema_cnpj_idx" ON "configuracoes_sistema"("cnpj");

-- CreateIndex
CREATE INDEX "configuracoes_sistema_licencaStatus_idx" ON "configuracoes_sistema"("licencaStatus");
