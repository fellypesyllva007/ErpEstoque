export interface ActivationPayload {
  instalacaoId: string;
  cnpj: string;

  hardwareFingerprint: string;

  licencaPlano: string;
  licencaStatus: string;

  emitidaEm: string;
  expiraEm: string;

  nonceLicenca: number;
}

export interface ActivationFile {
  magic: "ERPX";
  version: 1;

  payload: ActivationPayload;

  signature: string;
}
