export interface CreateProdutoDto {
  codigoInterno: string;
  codigoFornecedor?: string;
  nome: string;
  categoriaId: string;
  marcaId: string;
  fornecedorId?: string;
  custo: number;
  precoVenda: number;
  estoqueAtual?: number;
  estoqueMinimo?: number;
  localizacaoFisica?: string;
  compatibilidades?: string[]; // modeloId[]
}

export interface UpdateProdutoDto {
  codigoFornecedor?: string;
  nome?: string;
  categoriaId?: string;
  marcaId?: string;
  fornecedorId?: string;
  custo?: number;
  precoVenda?: number;
  estoqueMinimo?: number;
  localizacaoFisica?: string;
  ativo?: boolean;
  compatibilidades?: string[];
}
