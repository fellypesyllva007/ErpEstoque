export interface CreateClienteDto {
  nome: string;
  cpf?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
}

export interface UpdateClienteDto {
  nome?: string;
  cpf?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  ativo?: boolean;
}
