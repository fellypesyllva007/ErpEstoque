import { prisma } from "../../core/prisma/prisma.js";

export class DashboardService {
  async indicadores() {
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
      prisma.produto.count({ where: { ativo: true } }),
      prisma.produto.count({ where: { ativo: true, estoqueAtual: 0 } }),
      prisma.fornecedor.count({ where: { ativo: true } }),
      prisma.usuario.count({ where: { ativo: true } }),
      prisma.movimentacaoEstoque.count({ where: { criadoEm: { gte: hoje } } }),
      prisma.ordemServico.count({ where: { status: { in: ["ABERTA", "EM_ANDAMENTO", "AGUARDANDO_PECA"] } } }),
      prisma.pedidoCompra.count({ where: { status: { in: ["RASCUNHO", "ENVIADO", "PARCIAL"] } } }),
    ]);

    const produtosBaixo = await prisma.produto.findMany({
      where: { ativo: true, estoqueAtual: { gt: 0 } },
      select: { estoqueAtual: true, estoqueMinimo: true },
    });
    const qtdEstoqueBaixo = produtosBaixo.filter(p => p.estoqueAtual <= p.estoqueMinimo).length;

    return {
      totalProdutos,
      estoqueBaixo: qtdEstoqueBaixo,
      estoqueZerado,
      totalFornecedores,
      totalUsuarios,
      movimentacoesHoje,
      osAbertas,
      pedidosAbertos,
    };
  }

  async movimentacoesRecentes() {
    return prisma.movimentacaoEstoque.findMany({
      include: { produto: { select: { nome: true, codigoInterno: true } } },
      orderBy: { criadoEm: "desc" },
      take: 10,
    });
  }

  async alertasEstoque() {
    const produtos = await prisma.produto.findMany({
      where: { ativo: true },
      select: {
        id: true, nome: true, codigoInterno: true,
        estoqueAtual: true, estoqueMinimo: true,
        categoria: { select: { nome: true } },
      },
      orderBy: { estoqueAtual: "asc" },
    });
    return produtos.filter(p => p.estoqueAtual <= p.estoqueMinimo).slice(0, 20);
  }
}
