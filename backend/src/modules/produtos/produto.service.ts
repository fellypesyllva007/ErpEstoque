import { prisma } from "../../core/prisma/prisma.js";
import { CreateProdutoDto, UpdateProdutoDto } from "./produto.types.js";

export class ProdutoService {
  async listar() {
    return prisma.produto.findMany({
      include: { categoria: true, marca: true, fornecedor: true },
      orderBy: { nome: "asc" },
    });
  }

  async buscarPorId(id: string) {
    return prisma.produto.findUnique({
      where: { id },
      include: {
        categoria: true,
        marca: true,
        fornecedor: true,
        compatibilidades: { include: { modelo: true } },
      },
    });
  }

  async criar(data: CreateProdutoDto, usuarioId: string) {
    const { compatibilidades, ...dadosProduto } = data;

    const produto = await prisma.produto.create({
      data: {
        ...dadosProduto,
        compatibilidades: compatibilidades?.length
          ? { create: compatibilidades.map((modeloId) => ({ modeloId })) }
          : undefined,
      },
      include: { categoria: true, marca: true, fornecedor: true },
    });

    await prisma.auditoriaProduto.create({
      data: {
        produtoId: produto.id,
        usuarioId,
        acao: "CRIAR",
        dadosDepois: produto as object,
      },
    });

    return produto;
  }

  async atualizar(id: string, data: UpdateProdutoDto, usuarioId: string) {
    const { compatibilidades, ...dadosProduto } = data;

    const antes = await prisma.produto.findUnique({ where: { id } });

    const produto = await prisma.produto.update({
      where: { id },
      data: {
        ...dadosProduto,
        ...(compatibilidades !== undefined && {
          compatibilidades: {
            deleteMany: {},
            create: compatibilidades.map((modeloId) => ({ modeloId })),
          },
        }),
      },
      include: { categoria: true, marca: true, fornecedor: true },
    });

    await prisma.auditoriaProduto.create({
      data: {
        produtoId: produto.id,
        usuarioId,
        acao: "EDITAR",
        dadosAntes: antes as object,
        dadosDepois: produto as object,
      },
    });

    return produto;
  }

  async excluir(id: string, usuarioId: string) {
    const produto = await prisma.produto.update({
      where: { id },
      data: { ativo: false },
    });

    await prisma.auditoriaProduto.create({
      data: {
        produtoId: id,
        usuarioId,
        acao: "EXCLUIR",
        dadosAntes: produto as object,
      },
    });

    return produto;
  }

  async estoqueBaixo() {
    return prisma.produto.findMany({
      where: {
        ativo: true,
        AND: [
          { estoqueAtual: { gt: 0 } },
        ],
      },
      include: { categoria: true, marca: true },
      orderBy: { estoqueAtual: "asc" },
    });
  }

  async estoqueZerado() {
    return prisma.produto.findMany({
      where: { ativo: true, estoqueAtual: 0 },
      include: { categoria: true, marca: true },
      orderBy: { nome: "asc" },
    });
  }
}
