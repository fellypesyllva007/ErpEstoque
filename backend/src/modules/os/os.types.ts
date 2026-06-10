export type StatusOS = "ABERTA" | "EM_ANDAMENTO" | "AGUARDANDO_PECA" | "CONCLUIDA" | "CANCELADA";

export interface CreateOSDto {
  clienteId: string;
  aparelho: string;
  modelo: string;
  imei?: string;
  descricaoProblema: string;
  tecnicoId?: string;
  observacoes?: string;
}

export interface UpdateOSDto {
  status?: StatusOS;
  tecnicoId?: string;
  laudoTecnico?: string;
  solucaoAplicada?: string;
  valorServico?: number;
  valorMaoObra?: number;
  garantiaDias?: number;
  observacoes?: string;
  dataPrevisao?: string;
}

export interface AdicionarPecaDto {
  produtoId: string;
  quantidade: number;
  precoUnitario: number;
}
