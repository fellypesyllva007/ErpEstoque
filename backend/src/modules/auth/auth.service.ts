import bcrypt from "bcrypt";

import { prisma } from "../../core/prisma/prisma.js";
import { LoginRequest, LoginResponse } from "./auth.types.js";
import { criarRefreshToken, gerarAccessToken } from "../../core/auth-tokens.js";
import { montarCodigoPermissao } from "../../core/business-rules.js";

export class AuthService {
  private async listarAcessos(usuarioId: string) {
    return prisma.usuarioFilial.findMany({
      where: { usuarioId, ativo: true, empresa: { ativo: true }, filial: { ativo: true } },
      include: { empresa: { select: { nome: true } }, filial: { select: { nome: true } } },
      orderBy: { criadoEm: "asc" },
    });
  }

  private async listarPermissoes(perfilId: string) {
    const perfilPermissoes = await prisma.perfilPermissao.findMany({
      where: { perfilId },
      include: { permissao: { include: { tela: { include: { modulo: true } } } } },
    });

    return perfilPermissoes.map((item) =>
      montarCodigoPermissao(
        item.permissao.tela.modulo.codigo,
        item.permissao.tela.codigo,
        item.permissao.codigo
      )
    );
  }

  private selecionarContexto(
    acessos: Awaited<ReturnType<AuthService["listarAcessos"]>>,
    empresaId?: string,
    filialId?: string
  ) {
    if (empresaId || filialId) {
      const acesso = acessos.find((item) => item.empresaId === empresaId && item.filialId === filialId);
      if (!acesso) throw new Error("Usuário sem acesso à empresa/filial informada");
      return acesso;
    }

    if (acessos.length !== 1) {
      throw new Error("Selecione empresa e filial para continuar");
    }

    return acessos[0];
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    const usuario = await prisma.usuario.findUnique({
      where: { usuario: data.usuario },
      include: { perfil: true },
    });

    if (!usuario || !usuario.ativo) throw new Error("Usuário ou senha inválidos");

    const senhaValida = await bcrypt.compare(data.senha, usuario.senhaHash);
    if (!senhaValida) throw new Error("Usuário ou senha inválidos");

    const acessos = await this.listarAcessos(usuario.id);
    if (!acessos.length) throw new Error("Usuário sem vínculo ativo com empresa/filial");

    const contexto = this.selecionarContexto(acessos, data.empresaId ?? usuario.empresaId ?? undefined, data.filialId ?? usuario.filialId ?? undefined);
    const permissoes = await this.listarPermissoes(usuario.perfilId);

    const token = gerarAccessToken({ id: usuario.id, usuario: usuario.usuario, perfil: usuario.perfil.nome, empresaId: contexto.empresaId, filialId: contexto.filialId }, process.env.JWT_SECRET as string);
    const refreshToken = criarRefreshToken();

    await prisma.$transaction([
      prisma.refreshToken.create({ data: { usuarioId: usuario.id, token: refreshToken.token, expiraEm: refreshToken.expiraEm } }),
      prisma.usuario.update({ where: { id: usuario.id }, data: { ultimoLogin: new Date(), empresaId: contexto.empresaId, filialId: contexto.filialId } }),
      prisma.auditoriaGeral.create({ data: { usuarioId: usuario.id, empresaId: contexto.empresaId, filialId: contexto.filialId, tabela: "auth", registro: usuario.id, acao: "LOGIN" } }),
    ]);

    return {
      id: usuario.id,
      nome: usuario.nome,
      usuario: usuario.usuario,
      perfil: usuario.perfil.nome,
      empresaId: contexto.empresaId,
      filialId: contexto.filialId,
      primeiroAcesso: usuario.senhaTemporaria,
      permissoes,
      acessos: acessos.map((item) => ({ empresaId: item.empresaId, filialId: item.filialId, empresaNome: item.empresa?.nome, filialNome: item.filial?.nome })),
      token,
      refreshToken: refreshToken.token,
    };
  }

  async trocarContexto(usuarioId: string, empresaId: string, filialId: string) {
    const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId }, include: { perfil: true } });
    if (!usuario || !usuario.ativo) throw new Error("Usuário não encontrado ou inativo");

    const acessos = await this.listarAcessos(usuario.id);
    const contexto = this.selecionarContexto(acessos, empresaId, filialId);
    const permissoes = await this.listarPermissoes(usuario.perfilId);
    const token = gerarAccessToken({ id: usuario.id, usuario: usuario.usuario, perfil: usuario.perfil.nome, empresaId: contexto.empresaId, filialId: contexto.filialId }, process.env.JWT_SECRET as string);

    await prisma.$transaction([
      prisma.usuario.update({ where: { id: usuario.id }, data: { empresaId: contexto.empresaId, filialId: contexto.filialId } }),
      prisma.auditoriaGeral.create({ data: { usuarioId: usuario.id, empresaId: contexto.empresaId, filialId: contexto.filialId, tabela: "auth", registro: usuario.id, acao: "TROCA_CONTEXTO" } }),
    ]);

    return { token, empresaId: contexto.empresaId, filialId: contexto.filialId, permissoes };
  }

  async refreshAccessToken(refreshToken: string, empresaId?: string, filialId?: string) {
    const tokenRegistro = await prisma.refreshToken.findUnique({ where: { token: refreshToken }, include: { usuario: { include: { perfil: true } } } });
    if (!tokenRegistro) throw new Error("Refresh token inválido");
    if (tokenRegistro.revogado) throw new Error("Refresh token revogado");
    if (tokenRegistro.expiraEm < new Date()) throw new Error("Refresh token expirado");

    const acessos = await this.listarAcessos(tokenRegistro.usuario.id);
    const contexto = this.selecionarContexto(acessos, empresaId ?? tokenRegistro.usuario.empresaId ?? undefined, filialId ?? tokenRegistro.usuario.filialId ?? undefined);
    const accessToken = gerarAccessToken({ id: tokenRegistro.usuario.id, usuario: tokenRegistro.usuario.usuario, perfil: tokenRegistro.usuario.perfil.nome, empresaId: contexto.empresaId, filialId: contexto.filialId }, process.env.JWT_SECRET as string);
    const novoRefreshToken = criarRefreshToken();

    await prisma.$transaction([
      prisma.refreshToken.update({ where: { id: tokenRegistro.id }, data: { revogado: true } }),
      prisma.refreshToken.create({ data: { usuarioId: tokenRegistro.usuario.id, token: novoRefreshToken.token, expiraEm: novoRefreshToken.expiraEm } }),
    ]);

    return { token: accessToken, refreshToken: novoRefreshToken.token, empresaId: contexto.empresaId, filialId: contexto.filialId };
  }

  async logout(refreshToken: string) {
    const tokens = await prisma.refreshToken.findMany({ where: { token: refreshToken }, select: { usuarioId: true } });
    await prisma.refreshToken.updateMany({ where: { token: refreshToken }, data: { revogado: true } });
    for (const item of tokens) await prisma.auditoriaGeral.create({ data: { usuarioId: item.usuarioId, tabela: "auth", registro: item.usuarioId, acao: "LOGOUT" } });
    return { message: "Logout realizado com sucesso" };
  }
}
