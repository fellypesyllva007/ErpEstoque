export interface LoginRequest {
  usuario: string;
  senha: string;
}

export interface LoginResponse {
  id: string;
  nome: string;
  usuario: string;
  perfil: string;

  token: string;
  refreshToken: string;
}
