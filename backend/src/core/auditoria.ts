import { TenantContext } from "./tenant.js";
import { prisma } from "./prisma/prisma.js";

export async function registrarAuditoria(params: {
  usuarioId?: string;
  tabela: string;
  registro: string;
  acao: string;
  dadosAntes?: object;
  dadosDepois?: object;
  ip?: string;
  tenant?: Pick<TenantContext, "empresaId" | "filialId">;
}) {
  try {
    const { tenant, ...data } = params;
    await prisma.auditoriaGeral.create({
      data: {
        ...data,
        empresaId: tenant?.empresaId,
        filialId: tenant?.filialId,
      },
    });
  } catch {
    // auditoria nunca deve quebrar o fluxo principal
  }
}
