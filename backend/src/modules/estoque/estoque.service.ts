import { prisma } from "../../core/prisma/prisma.js";
import { TenantContext, tenantCreate, tenantWhere } from "../../core/tenant.js";
import { MovimentacaoDto } from "./estoque.types.js";

export class EstoqueService {
  async registrarMovimentacao(data: MovimentacaoDto, ctx: TenantContext) {
    const produto = await prisma.produto.findFirstOrThrow({ where: { id: data.produtoId, ...tenantWhere(ctx) } });

    const estoqueAnterior = produto.estoqueAtual;
    let estoquePosterior: number;

    if (data.tipo === "ENTRADA") {
      estoquePosterior = estoqueAnterior + data.quantidade;
    } else if (data.tipo === "SAIDA") {
      if (estoqueAnterior < data.quantidade) throw new Error("Estoque insuficiente");
      estoquePosterior = estoqueAnterior - data.quantidade;
    } else {
      estoquePosterior = data.quantidade;
    }

    const [movimentacao] = await prisma.$transaction([
      prisma.movimentacaoEstoque.create({
        data: {
          ...tenantCreate(ctx),
          produtoId: data.produtoId,
          tipo: data.tipo,
          quantidade: data.quantidade,
          estoqueAnterior,
          estoquePosterior,
          observacao: data.observacao,
        },
      }),
      prisma.produto.update({
        where: { id: data.produtoId },
        data: { estoqueAtual: estoquePosterior },
      }),
    ]);

    return movimentacao;
  }

  async listarMovimentacoes(ctx: TenantContext, produtoId?: string) {
    return prisma.movimentacaoEstoque.findMany({
      where: { ...tenantWhere(ctx), ...(produtoId ? { produtoId } : {}) },
      include: { produto: { select: { nome: true, codigoInterno: true } } },
      orderBy: { criadoEm: "desc" },
      take: 200,
    });
  }

  async resumoPorProduto(ctx: TenantContext, produtoId: string) {
    await prisma.produto.findFirstOrThrow({ where: { id: produtoId, ...tenantWhere(ctx) } });
    return prisma.movimentacaoEstoque.groupBy({
      by: ["tipo"],
      where: { produtoId, ...tenantWhere(ctx) },
      _sum: { quantidade: true },
    });
  }
}
