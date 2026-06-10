ALTER TABLE configuracoes_sistema
ADD COLUMN IF NOT EXISTS "licencaArquivoHash" TEXT;

ALTER TABLE configuracoes_sistema
ADD COLUMN IF NOT EXISTS "licencaArquivoRecebidoEm" TIMESTAMP(3);
