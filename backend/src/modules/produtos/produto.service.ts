import { prisma } from "../../core/prisma/prisma.js";
import { TenantContext, tenantCreate, tenantWhere } from "../../core/tenant.js";
import { CreateProdutoDto, UpdateProdutoDto } from "./produto.types.js";

export class ProdutoService {
  async listar(ctx: TenantContext) {
    return prisma.produto.findMany({
      where: tenantWhere(ctx),
      include: { categoria: true, marca: true, fornecedor: true },
      orderBy: { nome: "asc" },
    });
  }

  async buscarPorId(id: string, ctx: TenantContext) {
    return prisma.produto.findFirst({
      where: { id, ...tenantWhere(ctx) },
      include: {
        categoria: true,
        marca: true,
        fornecedor: true,
        compatibilidades: { include: { modelo: true } },
      },
    });
  }

  async criar(data: CreateProdutoDto, usuarioId: string, ctx: TenantContext) {
    const { compatibilidades, ...dadosProduto } = data;

    const produto = await prisma.produto.create({
      data: {
        ...dadosProduto,
        ...tenantCreate(ctx),
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
        ...tenantCreate(ctx),
        acao: "CRIAR",
        dadosDepois: produto as object,
      },
    });

    return produto;
  }

  async atualizar(id: string, data: UpdateProdutoDto, usuarioId: string, ctx: TenantContext) {
    const { compatibilidades, ...dadosProduto } = data;

    const antes = await this.buscarPorId(id, ctx);
    if (!antes) throw new Error("Produto não encontrado");

    const produto = await prisma.produto.update({
      where: { id },
      data: {
        ...dadosProduto,
        ...tenantCreate(ctx),
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
        ...tenantCreate(ctx),
        acao: "EDITAR",
        dadosAntes: antes as object,
        dadosDepois: produto as object,
      },
    });

    return produto;
  }

  async excluir(id: string, usuarioId: string, ctx: TenantContext) {
    const atual = await this.buscarPorId(id, ctx);
    if (!atual) throw new Error("Produto não encontrado");
    const produto = await prisma.produto.update({
      where: { id },
      data: { ativo: false },
    });

    await prisma.auditoriaProduto.create({
      data: {
        produtoId: id,
        usuarioId,
        ...tenantCreate(ctx),
        acao: "EXCLUIR",
        dadosAntes: produto as object,
      },
    });

    return produto;
  }

  async estoqueBaixo(ctx: TenantContext) {
    return prisma.produto.findMany({
      where: {
        ...tenantWhere(ctx),
        ativo: true,
        AND: [
          { estoqueAtual: { gt: 0 } },
        ],
      },
      include: { categoria: true, marca: true },
      orderBy: { estoqueAtual: "asc" },
    });
  }

  async estoqueZerado(ctx: TenantContext) {
    return prisma.produto.findMany({
      where: { ...tenantWhere(ctx), ativo: true, estoqueAtual: 0 },
      include: { categoria: true, marca: true },
      orderBy: { nome: "asc" },
    });
  }
}
