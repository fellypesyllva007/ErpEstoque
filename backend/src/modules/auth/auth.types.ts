export interface LoginRequest {
  usuario: string;
  senha: string;
  empresaId?: string;
  filialId?: string;
}

export interface LoginResponse {
  id: string;
  nome: string;
  usuario: string;
  perfil: string;
  empresaId: string;
  filialId: string;
  primeiroAcesso: boolean;

  token: string;
  refreshToken: string;
}
