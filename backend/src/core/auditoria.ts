import { prisma } from "./prisma/prisma.js";

export async function registrarAuditoria(params: {
  usuarioId?: string;
  tabela: string;
  registro: string;
  acao: string;
  dadosAntes?: object;
  dadosDepois?: object;
  ip?: string;
}) {
  try {
    await prisma.auditoriaGeral.create({ data: params });
  } catch {
    // auditoria nunca deve quebrar o fluxo principal
  }
}
