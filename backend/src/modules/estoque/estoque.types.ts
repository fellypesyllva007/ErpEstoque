export interface MovimentacaoDto {
  produtoId: string;
  tipo: "ENTRADA" | "SAIDA" | "AJUSTE" | "TRANSFERENCIA";
  quantidade: number;
  observacao?: string;
}
