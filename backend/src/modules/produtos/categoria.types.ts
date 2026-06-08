export interface CreateCategoriaDto {
  nome: string;
  descricao?: string;
}

export interface UpdateCategoriaDto {
  nome?: string;
  descricao?: string;
}

export interface CategoriaResponse {
  id: string;
  nome: string;
  descricao: string | null;
  criadoEm: Date;
  atualizadoEm: Date;
}
