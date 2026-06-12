import bcrypt from "bcrypt";

import { prisma } from "../../core/prisma/prisma.js";
import { LoginRequest, LoginResponse } from "./auth.types.js";
import { criarRefreshToken, gerarAccessToken } from "../../core/auth-tokens.js";

export class AuthService {
  async login(
    data: LoginRequest
  ): Promise<LoginResponse> {
    const usuario = await prisma.usuario.findUnique({
      where: {
        usuario: data.usuario,
      },
      include: {
        perfil: true,
      },
    });

    if (!usuario) {
      throw new Error("Usuário ou senha inválidos");
    }

    const senhaValida = await bcrypt.compare(
      data.senha,
      usuario.senhaHash
    );

    if (!senhaValida) {
      throw new Error("Usuário ou senha inválidos");
    }

    const acessos = await prisma.usuarioFilial.findMany({
      where: { usuarioId: usuario.id, ativo: true },
      orderBy: { criadoEm: "asc" },
    });

    const empresaId = data.empresaId ?? usuario.empresaId ?? acessos[0]?.empresaId;
    const filialId = data.filialId ?? usuario.filialId ?? acessos.find((a) => a.empresaId === empresaId)?.filialId;

    if (!empresaId || !filialId || !acessos.some((a) => a.empresaId === empresaId && a.filialId === filialId)) {
      throw new Error("Usuário sem contexto empresarial válido");
    }

    const token = gerarAccessToken(
      {
        id: usuario.id,
        usuario: usuario.usuario,
        perfil: usuario.perfil.nome,
        empresaId,
        filialId,
      },
      process.env.JWT_SECRET as string
    );

    const refreshToken = criarRefreshToken();

    await prisma.$transaction([
      prisma.refreshToken.create({
        data: {
          usuarioId: usuario.id,
          token: refreshToken.token,
          expiraEm: refreshToken.expiraEm,
        },
      }),
      prisma.usuario.update({
        where: { id: usuario.id },
        data: { ultimoLogin: new Date() },
      }),
      prisma.auditoriaGeral.create({
        data: { usuarioId: usuario.id, empresaId, filialId, tabela: "auth", registro: usuario.id, acao: "LOGIN" },
      }),
    ]);

    return {
      id: usuario.id,
      nome: usuario.nome,
      usuario: usuario.usuario,
      perfil: usuario.perfil.nome,
      empresaId,
      filialId,
      primeiroAcesso: usuario.senhaTemporaria,
      token,
      refreshToken: refreshToken.token,
    };
  }

  async refreshAccessToken(refreshToken: string) {
    const tokenRegistro = await prisma.refreshToken.findUnique({
      where: {
        token: refreshToken,
      },
      include: {
        usuario: {
          include: {
            perfil: true,
          },
        },
      },
    });

    if (!tokenRegistro) {
      throw new Error("Refresh token inválido");
    }

    if (tokenRegistro.revogado) {
      throw new Error("Refresh token revogado");
    }

    if (tokenRegistro.expiraEm < new Date()) {
      throw new Error("Refresh token expirado");
    }

    const acessos = await prisma.usuarioFilial.findMany({
      where: { usuarioId: tokenRegistro.usuario.id, ativo: true },
      orderBy: { criadoEm: "asc" },
    });
    const empresaId = tokenRegistro.usuario.empresaId ?? acessos[0]?.empresaId;
    const filialId = tokenRegistro.usuario.filialId ?? acessos[0]?.filialId;

    if (!empresaId || !filialId) {
      throw new Error("Contexto empresarial não encontrado para o usuário");
    }

    const accessToken = gerarAccessToken(
      {
        id: tokenRegistro.usuario.id,
        usuario: tokenRegistro.usuario.usuario,
        perfil: tokenRegistro.usuario.perfil.nome,
        empresaId,
        filialId,
      },
      process.env.JWT_SECRET as string
    );

    const novoRefreshToken = criarRefreshToken();

    await prisma.$transaction([
      prisma.refreshToken.update({
        where: { id: tokenRegistro.id },
        data: { revogado: true },
      }),
      prisma.refreshToken.create({
        data: {
          usuarioId: tokenRegistro.usuario.id,
          token: novoRefreshToken.token,
          expiraEm: novoRefreshToken.expiraEm,
        },
      }),
    ]);

    return {
      token: accessToken,
      refreshToken: novoRefreshToken.token,
    };
  }

  async logout(refreshToken: string) {
    const tokens = await prisma.refreshToken.findMany({ where: { token: refreshToken }, select: { usuarioId: true } });
    await prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { revogado: true },
    });
    for (const item of tokens) {
      await prisma.auditoriaGeral.create({ data: { usuarioId: item.usuarioId, tabela: "auth", registro: item.usuarioId, acao: "LOGOUT" } });
    }

    return {
      message: "Logout realizado com sucesso",
    };
  }
}
