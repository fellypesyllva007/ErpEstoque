import { prisma } from "../../core/prisma/prisma.js";
import { TenantContext, tenantWhere } from "../../core/tenant.js";
import {
  calcularSugestaoReposicaoProduto,
  deveExibirSugestaoReposicao,
} from "../../core/business-rules.js";

function intervalo(dataInicio?: string, dataFim?: string) {
  return dataInicio || dataFim
    ? {
        criadoEm: {
          ...(dataInicio ? { gte: new Date(dataInicio) } : {}),
          ...(dataFim ? { lte: new Date(dataFim + "T23:59:59") } : {}),
        },
      }
    : {};
}

export class RelatoriosService {
  async estoqueCompleto(ctx: TenantContext) {
    return prisma.produto.findMany({
      where: { ...tenantWhere(ctx), ativo: true },
      include: { categoria: true, marca: true, fornecedor: { select: { nome: true } } },
      orderBy: [{ categoria: { nome: "asc" } }, { nome: "asc" }],
    });
  }

  async movimentacoesDetalhadas(ctx: TenantContext, dataInicio?: string, dataFim?: string) {
    return prisma.movimentacaoEstoque.findMany({
      where: { ...tenantWhere(ctx), ...intervalo(dataInicio, dataFim) },
      include: { produto: { select: { nome: true, codigoInterno: true, categoria: { select: { nome: true } } } } },
      orderBy: { criadoEm: "desc" },
    });
  }

  async sugestaoReposicao(ctx: TenantContext) {
    const trintaDiasAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const produtos = await prisma.produto.findMany({
      where: { ...tenantWhere(ctx), ativo: true },
      include: { fornecedor: { select: { nome: true } } },
    });

    const movimentacoes = await prisma.movimentacaoEstoque.findMany({
      where: { ...tenantWhere(ctx), tipo: "SAIDA", criadoEm: { gte: trintaDiasAtras } },
    });

    const saidaPorProduto: Record<string, number> = {};
    for (const m of movimentacoes) {
      saidaPorProduto[m.produtoId] = (saidaPorProduto[m.produtoId] ?? 0) + m.quantidade;
    }

    return produtos.map((produto) =>
      calcularSugestaoReposicaoProduto(produto, saidaPorProduto[produto.id] ?? 0)
    )
    .filter(deveExibirSugestaoReposicao)
    .sort((a, b) => a.coberturaDias - b.coberturaDias);
  }

  async vendasPorPeriodo(ctx: TenantContext, dataInicio: string, dataFim: string) {
    return prisma.venda.findMany({
      where: { ...tenantWhere(ctx), status: "CONCLUIDA", ...intervalo(dataInicio, dataFim) },
      include: { cliente: { select: { nome: true } }, itens: { include: { produto: { select: { nome: true } } } } },
      orderBy: { criadoEm: "desc" },
    });
  }

  async comprasPorPeriodo(ctx: TenantContext, dataInicio: string, dataFim: string) {
    return prisma.pedidoCompra.findMany({
      where: { ...tenantWhere(ctx), status: { not: "CANCELADO" }, ...intervalo(dataInicio, dataFim) },
      include: { fornecedor: { select: { nome: true } }, itens: { include: { produto: { select: { nome: true } } } } },
      orderBy: { criadoEm: "desc" },
    });
  }

  async auditoria(ctx: TenantContext, tabela?: string, dataInicio?: string, dataFim?: string) {
    return prisma.auditoriaGeral.findMany({
      where: { ...tenantWhere(ctx), ...(tabela ? { tabela } : {}), ...intervalo(dataInicio, dataFim) },
      orderBy: { criadoEm: "desc" },
      take: 500,
    });
  }
}
