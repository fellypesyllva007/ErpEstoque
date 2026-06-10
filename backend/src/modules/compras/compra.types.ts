export interface ItemPedidoDto {
  produtoId: string;
  quantidade: number;
  custoUnitario: number;
}

export interface CreatePedidoDto {
  fornecedorId: string;
  observacoes?: string;
  itens: ItemPedidoDto[];
}

export interface ItemRecebimentoDto {
  produtoId: string;
  quantidade: number;
}

export interface RecebimentoDto {
  pedidoId: string;
  observacoes?: string;
  itens: ItemRecebimentoDto[];
}
