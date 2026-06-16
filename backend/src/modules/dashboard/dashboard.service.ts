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

    const [vendas, compras, receber, pagar, caixa, osPorStatus, produtosCriticos] = await Promise.all([
      prisma.venda.findMany({ where: { ...wherePeriodo, status: "CONCLUIDA" }, select: { valorTotal: true } }),
      prisma.pedidoCompra.findMany({ where: { ...wherePeriodo, status: { not: "CANCELADO" } }, select: { valorTotal: true } }),
      prisma.contaReceber.findMany({ where: { ...tenantWhere(ctx), status: { in: ["ABERTO", "PARCIAL"] } }, select: { valor: true, valorBaixado: true } }),
      prisma.contaPagar.findMany({ where: { ...tenantWhere(ctx), status: { in: ["ABERTO", "PARCIAL"] } }, select: { valor: true, valorBaixado: true } }),
      prisma.movimentoCaixa.findMany({ where: tenantWhere(ctx), select: { tipo: true, valor: true } }),
      prisma.ordemServico.groupBy({ by: ["status"], where: tenantWhere(ctx), _count: { id: true } }),
      prisma.produto.findMany({ where: { ...tenantWhere(ctx), ativo: true }, select: { id: true, nome: true, codigoInterno: true, estoqueAtual: true, estoqueMinimo: true } }),
    ]);

    const receita = vendas.reduce((s, v) => s + Number(v.valorTotal), 0);
    const custoCompras = compras.reduce((s, c) => s + Number(c.valorTotal), 0);
    const aReceber = receber.reduce((s, c) => s + Number(c.valor) - Number(c.valorBaixado), 0);
    const aPagar = pagar.reduce((s, c) => s + Number(c.valor) - Number(c.valorBaixado), 0);
    const saldoCaixa = caixa.reduce((s, m) => s + (m.tipo === "ENTRADA" ? Number(m.valor) : -Number(m.valor)), 0);
    const estoqueCritico = produtosCriticos.filter((p) => p.estoqueAtual <= p.estoqueMinimo);

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
    };
  }

}
