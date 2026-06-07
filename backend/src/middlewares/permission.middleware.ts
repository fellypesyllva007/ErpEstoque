import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware.js";

export function permissionMiddleware(
  perfisPermitidos: string[]
) {
  return (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    const perfil = req.user?.perfil;

    if (!perfil) {
      return res.status(401).json({
        message: "Usuário não autenticado",
      });
    }

    if (!perfisPermitidos.includes(perfil)) {
      return res.status(403).json({
        message: "Acesso negado",
      });
    }

    next();
  };
}
