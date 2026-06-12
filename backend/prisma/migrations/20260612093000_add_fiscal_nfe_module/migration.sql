-- Cadastro fiscal de produtos
ALTER TABLE "produtos" ADD COLUMN IF NOT EXISTS "ncm" TEXT;
ALTER TABLE "produtos" ADD COLUMN IF NOT EXISTS "cest" TEXT;
ALTER TABLE "produtos" ADD COLUMN IF NOT EXISTS "cfopPadrao" TEXT;
ALTER TABLE "produtos" ADD COLUMN IF NOT EXISTS "origemMercadoria" TEXT;
ALTER TABLE "produtos" ADD COLUMN IF NOT EXISTS "unidadeComercial" TEXT DEFAULT 'UN';
ALTER TABLE "produtos" ADD COLUMN IF NOT EXISTS "unidadeTributavel" TEXT DEFAULT 'UN';
ALTER TABLE "produtos" ADD COLUMN IF NOT EXISTS "gtinEan" TEXT;
ALTER TABLE "produtos" ADD COLUMN IF NOT EXISTS "pesoLiquido" DECIMAL(12,3);
ALTER TABLE "produtos" ADD COLUMN IF NOT EXISTS "pesoBruto" DECIMAL(12,3);
ALTER TABLE "produtos" ADD COLUMN IF NOT EXISTS "cstCsosnIcms" TEXT;
ALTER TABLE "produtos" ADD COLUMN IF NOT EXISTS "pis" TEXT;
ALTER TABLE "produtos" ADD COLUMN IF NOT EXISTS "cofins" TEXT;
ALTER TABLE "produtos" ADD COLUMN IF NOT EXISTS "ipi" TEXT;

CREATE TABLE "empresas" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "nome" TEXT NOT NULL,
  "cnpj" TEXT NOT NULL UNIQUE,
  "ativo" BOOLEAN NOT NULL DEFAULT true,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "empresas_nome_idx" ON "empresas"("nome");

CREATE TABLE "filiais" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "empresaId" TEXT NOT NULL,
  "nome" TEXT NOT NULL,
  "cnpj" TEXT NOT NULL UNIQUE,
  "ativo" BOOLEAN NOT NULL DEFAULT true,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "filiais_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "filiais_empresaId_idx" ON "filiais"("empresaId");

CREATE TABLE "emitentes_fiscais" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "filialId" TEXT,
  "cnpj" TEXT NOT NULL UNIQUE,
  "razaoSocial" TEXT NOT NULL,
  "nomeFantasia" TEXT,
  "inscricaoEstadual" TEXT,
  "inscricaoMunicipal" TEXT,
  "crt" TEXT,
  "cnae" TEXT,
  "logradouro" TEXT,
  "numero" TEXT,
  "complemento" TEXT,
  "bairro" TEXT,
  "municipio" TEXT,
  "municipioIbge" TEXT,
  "uf" TEXT NOT NULL,
  "cep" TEXT,
  "certificadoReferencia" TEXT,
  "ambienteFiscal" TEXT NOT NULL DEFAULT 'HOMOLOGACAO',
  "serieNfe" INTEGER NOT NULL DEFAULT 1,
  "serieNfce" INTEGER NOT NULL DEFAULT 1,
  "cscId" TEXT,
  "cscTokenReferencia" TEXT,
  "ativo" BOOLEAN NOT NULL DEFAULT true,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "emitentes_fiscais_filialId_fkey" FOREIGN KEY ("filialId") REFERENCES "filiais"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "emitentes_fiscais_filialId_idx" ON "emitentes_fiscais"("filialId");
CREATE INDEX "emitentes_fiscais_ambienteFiscal_idx" ON "emitentes_fiscais"("ambienteFiscal");
CREATE INDEX "emitentes_fiscais_uf_idx" ON "emitentes_fiscais"("uf");

CREATE TABLE "series_fiscais" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "emitenteId" TEXT NOT NULL,
  "modelo" TEXT NOT NULL,
  "serie" INTEGER NOT NULL,
  "proximoNumero" INTEGER NOT NULL DEFAULT 1,
  "ambienteFiscal" TEXT NOT NULL DEFAULT 'HOMOLOGACAO',
  "ativo" BOOLEAN NOT NULL DEFAULT true,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "series_fiscais_emitenteId_fkey" FOREIGN KEY ("emitenteId") REFERENCES "emitentes_fiscais"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "series_fiscais_emitenteId_modelo_serie_ambienteFiscal_key" ON "series_fiscais"("emitenteId","modelo","serie","ambienteFiscal");
CREATE INDEX "series_fiscais_emitenteId_idx" ON "series_fiscais"("emitenteId");

CREATE TABLE "naturezas_operacao" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "descricao" TEXT NOT NULL,
  "tipoOperacao" TEXT NOT NULL,
  "cfopPadrao" TEXT,
  "ativo" BOOLEAN NOT NULL DEFAULT true,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "naturezas_operacao_tipoOperacao_idx" ON "naturezas_operacao"("tipoOperacao");

CREATE TABLE "regras_tributarias" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "naturezaOperacaoId" TEXT,
  "regimeTributario" TEXT,
  "ufOrigem" TEXT,
  "ufDestino" TEXT,
  "ncm" TEXT,
  "cfop" TEXT,
  "cstCsosnIcms" TEXT,
  "aliquotaIcms" DECIMAL(7,4),
  "pis" TEXT,
  "aliquotaPis" DECIMAL(7,4),
  "cofins" TEXT,
  "aliquotaCofins" DECIMAL(7,4),
  "ipi" TEXT,
  "aliquotaIpi" DECIMAL(7,4),
  "ativo" BOOLEAN NOT NULL DEFAULT true,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "regras_tributarias_naturezaOperacaoId_fkey" FOREIGN KEY ("naturezaOperacaoId") REFERENCES "naturezas_operacao"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "regras_tributarias_naturezaOperacaoId_idx" ON "regras_tributarias"("naturezaOperacaoId");
CREATE INDEX "regras_tributarias_regimeTributario_idx" ON "regras_tributarias"("regimeTributario");
CREATE INDEX "regras_tributarias_ufOrigem_ufDestino_idx" ON "regras_tributarias"("ufOrigem","ufDestino");
CREATE INDEX "regras_tributarias_ncm_idx" ON "regras_tributarias"("ncm");

CREATE TABLE "documentos_fiscais" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "empresaId" TEXT,
  "filialId" TEXT,
  "emitenteId" TEXT,
  "serieFiscalId" TEXT,
  "naturezaOperacaoId" TEXT,
  "vendaId" TEXT,
  "ordemServicoId" TEXT,
  "clienteId" TEXT,
  "modelo" TEXT NOT NULL DEFAULT '55',
  "numero" INTEGER,
  "serie" INTEGER,
  "chave" TEXT UNIQUE,
  "clienteNome" TEXT,
  "valorTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "statusInterno" TEXT NOT NULL DEFAULT 'RASCUNHO',
  "statusSefaz" TEXT,
  "ambienteFiscal" TEXT NOT NULL DEFAULT 'HOMOLOGACAO',
  "dataEmissao" TIMESTAMP(3),
  "protocolo" TEXT,
  "justificativa" TEXT,
  "nfewebId" TEXT,
  "payloadFiscal" JSONB,
  "retornoGateway" JSONB,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "documentos_fiscais_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "documentos_fiscais_filialId_fkey" FOREIGN KEY ("filialId") REFERENCES "filiais"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "documentos_fiscais_emitenteId_fkey" FOREIGN KEY ("emitenteId") REFERENCES "emitentes_fiscais"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "documentos_fiscais_serieFiscalId_fkey" FOREIGN KEY ("serieFiscalId") REFERENCES "series_fiscais"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "documentos_fiscais_naturezaOperacaoId_fkey" FOREIGN KEY ("naturezaOperacaoId") REFERENCES "naturezas_operacao"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "documentos_fiscais_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "vendas"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "documentos_fiscais_ordemServicoId_fkey" FOREIGN KEY ("ordemServicoId") REFERENCES "ordens_servico"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "documentos_fiscais_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "documentos_fiscais_empresaId_idx" ON "documentos_fiscais"("empresaId");
CREATE INDEX "documentos_fiscais_vendaId_idx" ON "documentos_fiscais"("vendaId");
CREATE INDEX "documentos_fiscais_ordemServicoId_idx" ON "documentos_fiscais"("ordemServicoId");
CREATE INDEX "documentos_fiscais_clienteId_idx" ON "documentos_fiscais"("clienteId");
CREATE INDEX "documentos_fiscais_statusInterno_idx" ON "documentos_fiscais"("statusInterno");
CREATE INDEX "documentos_fiscais_statusSefaz_idx" ON "documentos_fiscais"("statusSefaz");
CREATE INDEX "documentos_fiscais_ambienteFiscal_idx" ON "documentos_fiscais"("ambienteFiscal");
CREATE INDEX "documentos_fiscais_dataEmissao_idx" ON "documentos_fiscais"("dataEmissao");

CREATE TABLE "documentos_fiscais_itens" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "documentoFiscalId" TEXT NOT NULL,
  "produtoId" TEXT,
  "codigoProduto" TEXT,
  "descricao" TEXT NOT NULL,
  "ncm" TEXT,
  "cest" TEXT,
  "cfop" TEXT,
  "unidadeComercial" TEXT DEFAULT 'UN',
  "unidadeTributavel" TEXT DEFAULT 'UN',
  "gtinEan" TEXT,
  "quantidade" DECIMAL(12,4) NOT NULL,
  "valorUnitario" DECIMAL(12,4) NOT NULL,
  "valorTotal" DECIMAL(12,2) NOT NULL,
  "cstCsosnIcms" TEXT,
  "pis" TEXT,
  "cofins" TEXT,
  "ipi" TEXT,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "documentos_fiscais_itens_documentoFiscalId_fkey" FOREIGN KEY ("documentoFiscalId") REFERENCES "documentos_fiscais"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "documentos_fiscais_itens_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "documentos_fiscais_itens_documentoFiscalId_idx" ON "documentos_fiscais_itens"("documentoFiscalId");
CREATE INDEX "documentos_fiscais_itens_produtoId_idx" ON "documentos_fiscais_itens"("produtoId");

CREATE TABLE "documentos_fiscais_eventos" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "documentoFiscalId" TEXT NOT NULL,
  "tipo" TEXT NOT NULL,
  "status" TEXT,
  "protocolo" TEXT,
  "justificativa" TEXT,
  "retornoGateway" JSONB,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "documentos_fiscais_eventos_documentoFiscalId_fkey" FOREIGN KEY ("documentoFiscalId") REFERENCES "documentos_fiscais"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "documentos_fiscais_eventos_documentoFiscalId_idx" ON "documentos_fiscais_eventos"("documentoFiscalId");
CREATE INDEX "documentos_fiscais_eventos_tipo_idx" ON "documentos_fiscais_eventos"("tipo");
CREATE INDEX "documentos_fiscais_eventos_criadoEm_idx" ON "documentos_fiscais_eventos"("criadoEm");

CREATE TABLE "documentos_fiscais_xml" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "documentoFiscalId" TEXT NOT NULL,
  "tipo" TEXT NOT NULL,
  "xml" TEXT NOT NULL,
  "hash" TEXT,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "documentos_fiscais_xml_documentoFiscalId_fkey" FOREIGN KEY ("documentoFiscalId") REFERENCES "documentos_fiscais"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "documentos_fiscais_xml_documentoFiscalId_idx" ON "documentos_fiscais_xml"("documentoFiscalId");
CREATE INDEX "documentos_fiscais_xml_tipo_idx" ON "documentos_fiscais_xml"("tipo");

CREATE TABLE "documentos_fiscais_status_historico" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "documentoFiscalId" TEXT NOT NULL,
  "statusAnterior" TEXT,
  "statusNovo" TEXT NOT NULL,
  "statusSefaz" TEXT,
  "observacao" TEXT,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "documentos_fiscais_status_historico_documentoFiscalId_fkey" FOREIGN KEY ("documentoFiscalId") REFERENCES "documentos_fiscais"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "documentos_fiscais_status_historico_documentoFiscalId_idx" ON "documentos_fiscais_status_historico"("documentoFiscalId");
CREATE INDEX "documentos_fiscais_status_historico_statusNovo_idx" ON "documentos_fiscais_status_historico"("statusNovo");
CREATE INDEX "documentos_fiscais_status_historico_criadoEm_idx" ON "documentos_fiscais_status_historico"("criadoEm");
