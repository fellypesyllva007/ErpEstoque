import bcrypt from "bcrypt";

import { prisma } from "../../core/prisma/prisma";
import { LoginRequest, LoginResponse } from "./auth.types";

export class AuthService {
  async login(data: LoginRequest): Promise<LoginResponse> {
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

    return {
      id: usuario.id,
      nome: usuario.nome,
      usuario: usuario.usuario,
      perfil: usuario.perfil.nome,
      token: "TOKEN_PROVISORIO"
    };
  }
}
