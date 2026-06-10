export interface CreateUsuarioDto {
  nome: string;
  email: string;
  usuario: string;
  senha: string;
  perfilId: string;
}

export interface UpdateUsuarioDto {
  nome?: string;
  email?: string;
  perfilId?: string;
  ativo?: boolean;
}

export interface AlterarSenhaDto {
  senhaAtual: string;
  novaSenha: string;
}
