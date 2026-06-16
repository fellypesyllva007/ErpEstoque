import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    sub: string;
    usuario: string;
    perfil: string;
    empresaId?: string;
    filialId?: string;
  };
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Token não informado",
    });
  }

  const [, token] = authHeader.split(" ");

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as {
      sub: string;
      usuario: string;
      perfil: string;
      empresaId?: string;
      filialId?: string;
    };

    req.user = payload;

    return next();
  } catch {
    return res.status(401).json({
      message: "Token inválido",
    });
  }
}
