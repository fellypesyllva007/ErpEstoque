import { prisma } from "../../core/prisma/prisma.js";

export class RelatoriosService {
  async estoqueCompleto() {
    return prisma.produto.findMany({
      where: { ativo: true },
      include: { categoria: true, marca: true, fornecedor: { select: { nome: true } } },
      orderBy: [{ categoria: { nome: "asc" } }, { nome: "asc" }],
    });
  }

  async movimentacoesDetalhadas(dataInicio?: string, dataFim?: string) {
    return prisma.movimentacaoEstoque.findMany({
      where: {
        ...(dataInicio || dataFim ? {
          criadoEm: {
            ...(dataInicio ? { gte: new Date(dataInicio) } : {}),
            ...(dataFim ? { lte: new Date(dataFim + "T23:59:59") } : {}),
          },
        } : {}),
      },
      include: { produto: { select: { nome: true, codigoInterno: true, categoria: { select: { nome: true } } } } },
      orderBy: { criadoEm: "desc" },
    });
  }

  async sugestaoReposicao() {
    const trintaDiasAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const produtos = await prisma.produto.findMany({
      where: { ativo: true },
      include: { fornecedor: { select: { nome: true } } },
    });

    const movimentacoes = await prisma.movimentacaoEstoque.findMany({
      where: { tipo: "SAIDA", criadoEm: { gte: trintaDiasAtras } },
    });

    const saidaPorProduto: Record<string, number> = {};
    for (const m of movimentacoes) {
      saidaPorProduto[m.produtoId] = (saidaPorProduto[m.produtoId] ?? 0) + m.quantidade;
    }

    return produtos.map(p => {
      const saidaMes = saidaPorProduto[p.id] ?? 0;
      const consumoDiario = saidaMes / 30;
      const coberturaDias = consumoDiario > 0 ? Math.floor(p.estoqueAtual / consumoDiario) : 999;
      const sugestaoCompra = Math.max(0, Math.ceil((p.estoqueMinimo * 2) - p.estoqueAtual));

      return {
        id: p.id,
        nome: p.nome,
        codigoInterno: p.codigoInterno,
        fornecedor: p.fornecedor?.nome,
        estoqueAtual: p.estoqueAtual,
        estoqueMinimo: p.estoqueMinimo,
        saidaMes,
        consumoDiario: Number(consumoDiario.toFixed(2)),
        coberturaDias,
        sugestaoCompra,
        criticidade: coberturaDias <= 7 ? "CRITICO" : coberturaDias <= 15 ? "ALERTA" : "OK",
      };
    })
    .filter(p => p.sugestaoCompra > 0 || p.criticidade !== "OK")
    .sort((a, b) => a.coberturaDias - b.coberturaDias);
  }

  async vendasPorPeriodo(dataInicio: string, dataFim: string) {
    return prisma.venda.findMany({
      where: {
        status: "CONCLUIDA",
        criadoEm: { gte: new Date(dataInicio), lte: new Date(dataFim + "T23:59:59") },
      },
      include: {
        cliente: { select: { nome: true } },
        itens: { include: { produto: { select: { nome: true } } } },
      },
      orderBy: { criadoEm: "desc" },
    });
  }

  async comprasPorPeriodo(dataInicio: string, dataFim: string) {
    return prisma.pedidoCompra.findMany({
      where: {
        status: { not: "CANCELADO" },
        criadoEm: { gte: new Date(dataInicio), lte: new Date(dataFim + "T23:59:59") },
      },
      include: {
        fornecedor: { select: { nome: true } },
        itens: { include: { produto: { select: { nome: true } } } },
      },
      orderBy: { criadoEm: "desc" },
    });
  }

  async auditoria(tabela?: string, dataInicio?: string, dataFim?: string) {
    return prisma.auditoriaGeral.findMany({
      where: {
        ...(tabela ? { tabela } : {}),
        ...(dataInicio || dataFim ? {
          criadoEm: {
            ...(dataInicio ? { gte: new Date(dataInicio) } : {}),
            ...(dataFim ? { lte: new Date(dataFim + "T23:59:59") } : {}),
          },
        } : {}),
      },
      orderBy: { criadoEm: "desc" },
      take: 500,
    });
  }
}
