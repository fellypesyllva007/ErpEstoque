import { prisma } from "../../core/prisma/prisma.js";
import { MovimentacaoDto } from "./estoque.types.js";

export class EstoqueService {
  async registrarMovimentacao(data: MovimentacaoDto) {
    const produto = await prisma.produto.findUniqueOrThrow({ where: { id: data.produtoId } });

    const estoqueAnterior = produto.estoqueAtual;
    let estoquePosterior: number;

    if (data.tipo === "ENTRADA") {
      estoquePosterior = estoqueAnterior + data.quantidade;
    } else if (data.tipo === "SAIDA") {
      if (estoqueAnterior < data.quantidade) throw new Error("Estoque insuficiente");
      estoquePosterior = estoqueAnterior - data.quantidade;
    } else {
      // AJUSTE ou TRANSFERENCIA: quantidade é o valor final
      estoquePosterior = data.quantidade;
    }

    const [movimentacao] = await prisma.$transaction([
      prisma.movimentacaoEstoque.create({
        data: {
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

  async listarMovimentacoes(produtoId?: string) {
    return prisma.movimentacaoEstoque.findMany({
      where: produtoId ? { produtoId } : undefined,
      include: { produto: { select: { nome: true, codigoInterno: true } } },
      orderBy: { criadoEm: "desc" },
      take: 200,
    });
  }

  async resumoPorProduto(produtoId: string) {
    return prisma.movimentacaoEstoque.groupBy({
      by: ["tipo"],
      where: { produtoId },
      _sum: { quantidade: true },
    });
  }
}
