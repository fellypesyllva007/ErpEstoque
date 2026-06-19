import { Response, NextFunction } from "express";
import { prisma } from "../core/prisma/prisma.js";
import { AuthRequest } from "./auth.middleware.js";
import { TenantRequest } from "../core/tenant.js";
import { montarCodigoPermissao } from "../core/business-rules.js";

import { avaliarAcessoAssinatura } from "../modules/saas/saas.rules.js";
export const PERMISSAO_ADMIN_SAAS = "saas.admin.gerenciar";
export const PERFIL_ADMIN_SAAS = "Administrador SaaS";

async function permissoesDoUsuario(usuarioId: string) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    include: { perfil: { include: { permissoes: { include: { permissao: { include: { tela: { include: { modulo: true } } } } } } } } },
  });
  if (!usuario) return null;
  const permissoes = usuario.perfil.permissoes.map((item) =>
    montarCodigoPermissao(item.permissao.tela.modulo.codigo, item.permissao.tela.codigo, item.permissao.codigo)
  );
  return { usuario, permissoes };
}

export async function requireSaasAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const usuarioId = req.user?.sub;
    if (!usuarioId) return res.status(401).json({ message: "Usuário não autenticado" });
    const acesso = await permissoesDoUsuario(usuarioId);
    if (!acesso) return res.status(401).json({ message: "Usuário não encontrado" });
    const adminPorPerfil = acesso.usuario.perfil.nome === PERFIL_ADMIN_SAAS;
    const adminPorPermissao = acesso.permissoes.includes(PERMISSAO_ADMIN_SAAS);
    if (!adminPorPerfil && !adminPorPermissao) {
      return res.status(403).json({ message: "Acesso restrito ao administrador da plataforma SaaS", permissaoRequerida: PERMISSAO_ADMIN_SAAS });
    }
    return next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao validar administrador SaaS" });
  }
}

export async function requireAssinaturaAtiva(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    const empresaId = req.tenant?.empresaId ?? req.user?.empresaId;
    if (!empresaId) return next();
    const assinatura = await prisma.saasAssinatura.findFirst({
      where: { empresaId },
      orderBy: { criadoEm: "desc" },
      include: { plano: true },
    });
    const acesso = avaliarAcessoAssinatura(assinatura);
    if (!acesso.permitido) return res.status(acesso.statusHttp).json(acesso);
    return next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao validar assinatura" });
  }
}
