import { prisma } from "../../core/prisma/prisma.js";
import { TenantContext, tenantWhere } from "../../core/tenant.js";

export class DashboardService {
  async indicadores(ctx: TenantContext) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const [
      totalProdutos,
      estoqueZerado,
      totalFornecedores,
      totalUsuarios,
      movimentacoesHoje,
      osAbertas,
      pedidosAbertos,
    ] = await Promise.all([
      prisma.produto.count({ where: { ...tenantWhere(ctx), ativo: true } }),
      prisma.produto.count({ where: { ...tenantWhere(ctx), ativo: true, estoqueAtual: 0 } }),
      prisma.fornecedor.count({ where: { ...tenantWhere(ctx), ativo: true } }),
      prisma.usuario.count({ where: { ...tenantWhere(ctx), ativo: true } }),
      prisma.movimentacaoEstoque.count({ where: { ...tenantWhere(ctx), criadoEm: { gte: hoje } } }),
      prisma.ordemServico.count({ where: { ...tenantWhere(ctx), status: { in: ["ABERTA", "EM_ANDAMENTO", "AGUARDANDO_PECA"] } } }),
      prisma.pedidoCompra.count({ where: { ...tenantWhere(ctx), status: { in: ["RASCUNHO", "ENVIADO", "PARCIAL"] } } }),
    ]);

    const produtosBaixo = await prisma.produto.findMany({
      where: { ...tenantWhere(ctx), ativo: true, estoqueAtual: { gt: 0 } },
      select: { estoqueAtual: true, estoqueMinimo: true },
    });
    const qtdEstoqueBaixo = produtosBaixo.filter(p => p.estoqueAtual <= p.estoqueMinimo).length;

    return { totalProdutos, estoqueBaixo: qtdEstoqueBaixo, estoqueZerado, totalFornecedores, totalUsuarios, movimentacoesHoje, osAbertas, pedidosAbertos };
  }

  async movimentacoesRecentes(ctx: TenantContext) {
    return prisma.movimentacaoEstoque.findMany({
      where: tenantWhere(ctx),
      include: { produto: { select: { nome: true, codigoInterno: true } } },
      orderBy: { criadoEm: "desc" },
      take: 10,
    });
  }

  async alertasEstoque(ctx: TenantContext) {
    const produtos = await prisma.produto.findMany({
      where: { ...tenantWhere(ctx), ativo: true },
      select: { id: true, nome: true, codigoInterno: true, estoqueAtual: true, estoqueMinimo: true, categoria: { select: { nome: true } } },
      orderBy: { estoqueAtual: "asc" },
    });
    return produtos.filter(p => p.estoqueAtual <= p.estoqueMinimo).slice(0, 20);
  }

  async executivo(ctx: TenantContext, dataInicio?: string, dataFim?: string) {
    const inicio = dataInicio ? new Date(dataInicio) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const fim = dataFim ? new Date(`${dataFim}T23:59:59`) : new Date();
    const wherePeriodo = { ...tenantWhere(ctx), criadoEm: { gte: inicio, lte: fim } };

    const [vendas, compras, receber, pagar, caixa, osPorStatus, produtosCriticos, itensVendidos] = await Promise.all([
      prisma.venda.findMany({ where: { ...wherePeriodo, status: "CONCLUIDA" }, select: { valorTotal: true } }),
      prisma.pedidoCompra.findMany({ where: { ...wherePeriodo, status: { not: "CANCELADO" } }, select: { valorTotal: true } }),
      prisma.contaReceber.findMany({ where: { ...tenantWhere(ctx), status: { in: ["ABERTO", "PARCIAL"] } }, select: { valor: true, valorBaixado: true, vencimento: true } }),
      prisma.contaPagar.findMany({ where: { ...tenantWhere(ctx), status: { in: ["ABERTO", "PARCIAL"] } }, select: { valor: true, valorBaixado: true } }),
      prisma.movimentoCaixa.findMany({ where: tenantWhere(ctx), select: { tipo: true, valor: true } }),
      prisma.ordemServico.groupBy({ by: ["status"], where: tenantWhere(ctx), _count: { id: true } }),
      prisma.produto.findMany({ where: { ...tenantWhere(ctx), ativo: true }, select: { id: true, nome: true, codigoInterno: true, estoqueAtual: true, estoqueMinimo: true } }),
      prisma.itemVenda.findMany({ where: { venda: { ...tenantWhere(ctx), status: "CONCLUIDA", criadoEm: { gte: inicio, lte: fim } } }, include: { produto: { select: { nome: true, codigoInterno: true } } } }),
    ]);

    const receita = vendas.reduce((s, v) => s + Number(v.valorTotal), 0);
    const custoCompras = compras.reduce((s, c) => s + Number(c.valorTotal), 0);
    const aReceber = receber.reduce((s, c) => s + Number(c.valor) - Number(c.valorBaixado), 0);
    const aPagar = pagar.reduce((s, c) => s + Number(c.valor) - Number(c.valorBaixado), 0);
    const saldoCaixa = caixa.reduce((s, m) => s + (m.tipo === "ENTRADA" ? Number(m.valor) : -Number(m.valor)), 0);
    const estoqueCritico = produtosCriticos.filter((p) => p.estoqueAtual <= p.estoqueMinimo);
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    const agingReceber = { aVencer: 0, vencidoAte30: 0, vencido31a60: 0, vencidoAcima60: 0 };
    for (const c of receber) {
      const saldo = Number(c.valor) - Number(c.valorBaixado);
      const dias = Math.floor((hoje.getTime() - c.vencimento.getTime()) / 86400000);
      if (dias > 60) agingReceber.vencidoAcima60 += saldo; else if (dias > 30) agingReceber.vencido31a60 += saldo; else if (dias > 0) agingReceber.vencidoAte30 += saldo; else agingReceber.aVencer += saldo;
    }
    const abcMap = new Map<string, { produtoId: string; produto: unknown; valor: number; quantidade: number }>();
    for (const item of itensVendidos) {
      const atual = abcMap.get(item.produtoId) ?? { produtoId: item.produtoId, produto: item.produto, valor: 0, quantidade: 0 };
      atual.valor += item.quantidade * Number(item.precoUnitario) - Number(item.desconto);
      atual.quantidade += item.quantidade;
      abcMap.set(item.produtoId, atual);
    }
    const curvaABC = Array.from(abcMap.values()).sort((a, b) => b.valor - a.valor).map((item, index, lista) => {
      const acumulado = lista.slice(0, index + 1).reduce((s, x) => s + x.valor, 0);
      const percentualAcumulado = receita ? (acumulado / receita) * 100 : 0;
      return { ...item, classe: percentualAcumulado <= 80 ? "A" : percentualAcumulado <= 95 ? "B" : "C", percentualAcumulado };
    });

    return {
      periodo: { dataInicio: inicio.toISOString(), dataFim: fim.toISOString() },
      receita,
      custoCompras,
      margemGerencial: receita - custoCompras,
      aReceber,
      aPagar,
      saldoCaixa,
      saldoProjetado: saldoCaixa + aReceber - aPagar,
      vendasQuantidade: vendas.length,
      comprasQuantidade: compras.length,
      osPorStatus: osPorStatus.map((item) => ({ status: item.status, total: item._count.id })),
      estoqueCritico: estoqueCritico.slice(0, 10),
      agingReceber,
      curvaABC: curvaABC.slice(0, 20),
      ticketMedio: vendas.length ? receita / vendas.length : 0,
    };
  }

}
