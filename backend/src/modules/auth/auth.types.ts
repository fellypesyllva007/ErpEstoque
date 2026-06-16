export interface LoginRequest {
  usuario: string;
  senha: string;
  empresaId?: string;
  filialId?: string;
}

export interface ContextoEmpresaFilial {
  empresaId: string;
  filialId: string;
  empresaNome?: string;
  filialNome?: string;
}

export interface LoginResponse {
  id: string;
  nome: string;
  usuario: string;
  perfil: string;
  empresaId: string;
  filialId: string;
  primeiroAcesso: boolean;
  permissoes: string[];
  acessos: ContextoEmpresaFilial[];

  token: string;
  refreshToken: string;
}
