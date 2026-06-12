import crypto from "crypto";
import jwt, { SignOptions } from "jsonwebtoken";

export interface JwtUsuarioPayload {
  id: string;
  usuario: string;
  perfil: string;
}

export interface RefreshTokenCriado {
  token: string;
  expiraEm: Date;
}

const TRINTA_DIAS_MS = 30 * 24 * 60 * 60 * 1000;

export function gerarAccessToken(
  usuario: JwtUsuarioPayload,
  secret: string,
  expiresIn: SignOptions["expiresIn"] = "8h"
): string {
  return jwt.sign(
    {
      sub: usuario.id,
      usuario: usuario.usuario,
      perfil: usuario.perfil,
    },
    secret,
    { expiresIn }
  );
}

export function criarRefreshToken(
  agora = new Date()
): RefreshTokenCriado {
  return {
    token: crypto.randomUUID(),
    expiraEm: new Date(agora.getTime() + TRINTA_DIAS_MS),
  };
}
