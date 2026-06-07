import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import { prisma } from "../../core/prisma/prisma";
import { LoginRequest, LoginResponse } from "./auth.types";

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

    const token = jwt.sign(
      {
        sub: usuario.id,
        usuario: usuario.usuario,
        perfil: usuario.perfil.nome,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "8h",
      }
    );

    const refreshToken = crypto.randomUUID();

    await prisma.refreshToken.create({
      data: {
        usuarioId: usuario.id,
        token: refreshToken,
        expiraEm: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ),
      },
    });

    return {
      id: usuario.id,
      nome: usuario.nome,
      usuario: usuario.usuario,
      perfil: usuario.perfil.nome,
      token,
      refreshToken,
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

    const accessToken = jwt.sign(
      {
        sub: tokenRegistro.usuario.id,
        usuario: tokenRegistro.usuario.usuario,
        perfil: tokenRegistro.usuario.perfil.nome,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "8h",
      }
    );

    return {
      token: accessToken,
    };
  }

  async logout(refreshToken: string) {
    await prisma.refreshToken.updateMany({
      where: {
        token: refreshToken,
      },
      data: {
        revogado: true,
      },
    });

    return {
      message: "Logout realizado com sucesso",
    };
  }
}
