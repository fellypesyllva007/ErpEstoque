export interface CreateMarcaDto {
  nome: string;
  descricao?: string;
}

export interface UpdateMarcaDto {
  nome?: string;
  descricao?: string;
}
