export type DocumentoFiscalStatus =
  | "RASCUNHO"
  | "VALIDADA"
  | "ASSINADA"
  | "ENVIADA"
  | "AUTORIZADA"
  | "REJEITADA"
  | "CANCELADA"
  | "DENEGADA"
  | "INUTILIZADA"
  | "CONTINGENCIA";

export interface CriarDocumentoFiscalDto {
  modelo?: "55" | "65";
  ambienteFiscal?: "HOMOLOGACAO" | "PRODUCAO";
  emitenteId?: string;
  naturezaOperacaoId?: string;
}

export interface AtualizarStatusFiscalDto {
  statusInterno: DocumentoFiscalStatus;
  statusSefaz?: string;
  protocolo?: string;
  chave?: string;
  justificativa?: string;
  retornoGateway?: Record<string, unknown>;
}
