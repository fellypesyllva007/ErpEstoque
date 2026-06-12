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
}
