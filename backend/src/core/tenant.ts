import { Response, NextFunction } from "express";
import { prisma } from "./prisma/prisma.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";

export interface TenantContext {
  empresaId: string;
  filialId: string;
  usuarioId: string;
}

export interface TenantRequest extends AuthRequest {
  tenant?: TenantContext;
}

export function tenantWhere(ctx: TenantContext) {
  return {
    empresaId: ctx.empresaId,
    filialId: ctx.filialId,
  };
}

export function tenantCreate(ctx: TenantContext) {
  return {
    empresaId: ctx.empresaId,
    filialId: ctx.filialId,
  };
}

export async function requireTenant(
  req: TenantRequest,
  res: Response,
  next: NextFunction
) {
  const usuarioId = req.user?.sub;
  if (!usuarioId) {
    return res.status(401).json({ message: "Usuário não autenticado" });
  }

  const empresaId = req.user?.empresaId ?? (req.headers["x-empresa-id"] as string | undefined);
  const filialId = req.user?.filialId ?? (req.headers["x-filial-id"] as string | undefined);

  if (!empresaId || !filialId) {
    return res.status(403).json({
      message: "Contexto empresarial obrigatório",
      detalhes: "Informe empresaId/filialId no login/token ou nos cabeçalhos X-Empresa-Id e X-Filial-Id.",
    });
  }

  const vinculo = await prisma.usuarioFilial.findFirst({
    where: { usuarioId, empresaId, filialId, ativo: true },
  });

  if (!vinculo) {
    return res.status(403).json({ message: "Usuário sem acesso à empresa/filial informada" });
  }

  req.tenant = { empresaId, filialId, usuarioId };
  return next();
}
