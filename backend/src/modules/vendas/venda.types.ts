export interface ItemVendaDto {
  produtoId: string;
  quantidade: number;
  precoUnitario: number;
  desconto?: number;
}

export interface CreateVendaDto {
  clienteId?: string;
  formaPagamento?: string;
  desconto?: number;
  observacoes?: string;
  itens: ItemVendaDto[];
}
