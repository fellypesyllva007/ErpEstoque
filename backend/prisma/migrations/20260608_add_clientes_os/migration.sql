-- CreateTable: clientes
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "endereco" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "clientes_cpf_key" ON "clientes"("cpf");
CREATE INDEX "clientes_nome_idx" ON "clientes"("nome");

-- CreateTable: ordens_servico
CREATE TABLE "ordens_servico" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "aparelho" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "imei" TEXT,
    "descricaoProblema" TEXT NOT NULL,
    "laudoTecnico" TEXT,
    "solucaoAplicada" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ABERTA',
    "tecnicoId" TEXT,
    "valorServico" DECIMAL(12,2),
    "observacoes" TEXT,
    "dataPrevisao" TIMESTAMP(3),
    "dataConclusao" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ordens_servico_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ordens_servico_numero_key" ON "ordens_servico"("numero");
CREATE INDEX "ordens_servico_clienteId_idx" ON "ordens_servico"("clienteId");
CREATE INDEX "ordens_servico_status_idx" ON "ordens_servico"("status");

ALTER TABLE "ordens_servico" ADD CONSTRAINT "ordens_servico_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ordens_servico" ADD CONSTRAINT "ordens_servico_tecnicoId_fkey" FOREIGN KEY ("tecnicoId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
