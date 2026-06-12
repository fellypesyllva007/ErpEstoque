import { prisma } from "../../core/prisma/prisma.js";
import { TenantContext, tenantWhere } from "../../core/tenant.js";

export class NotificacoesService {
  async alertasEstoque(ctx: TenantContext) {
    const produtos = await prisma.produto.findMany({
      where: { ...tenantWhere(ctx), ativo: true },
      select: { id: true, nome: true, codigoInterno: true, estoqueAtual: true, estoqueMinimo: true, categoria: { select: { nome: true } }, fornecedor: { select: { nome: true } } },
    });
    const alertas = [];
    for (const p of produtos) {
      if (p.estoqueAtual === 0) alertas.push({ tipo: "ZERADO", nivel: "CRITICO", produto: p, mensagem: `${p.nome} está com estoque zerado` });
      else if (p.estoqueAtual <= p.estoqueMinimo) alertas.push({ tipo: "BAIXO", nivel: "ALERTA", produto: p, mensagem: `${p.nome} está abaixo do estoque mínimo (${p.estoqueAtual}/${p.estoqueMinimo})` });
    }
    return { total: alertas.length, criticos: alertas.filter(a => a.nivel === "CRITICO").length, alertas: alertas.filter(a => a.nivel === "ALERTA").length, itens: alertas };
  }

  async resumoGeral(ctx: TenantContext) {
    const [pedidosAbertos, osAbertas, alertas] = await Promise.all([
      prisma.pedidoCompra.count({ where: { ...tenantWhere(ctx), status: { in: ["RASCUNHO", "ENVIADO", "PARCIAL"] } } }),
      prisma.ordemServico.count({ where: { ...tenantWhere(ctx), status: { in: ["ABERTA", "EM_ANDAMENTO", "AGUARDANDO_PECA"] } } }),
      this.alertasEstoque(ctx),
    ]);
    return { pedidosAbertos, osAbertas, alertasEstoque: alertas.total, criticos: alertas.criticos };
  }
}
