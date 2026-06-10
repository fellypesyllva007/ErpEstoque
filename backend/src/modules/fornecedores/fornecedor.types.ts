export interface CreateFornecedorDto {
  nome: string;
  razaoSocial?: string;
  cnpj?: string;
  telefone?: string;
  email?: string;
  contato?: string;
}

export interface UpdateFornecedorDto {
  nome?: string;
  razaoSocial?: string;
  cnpj?: string;
  telefone?: string;
  email?: string;
  contato?: string;
  ativo?: boolean;
}
