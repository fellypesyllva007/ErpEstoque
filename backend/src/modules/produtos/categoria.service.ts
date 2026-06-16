import { prisma } from "../../core/prisma/prisma.js";
import { TenantContext, tenantCreate, tenantWhere } from "../../core/tenant.js";
import { CreateCategoriaDto, UpdateCategoriaDto } from "./categoria.types.js";

export class CategoriaService {
  async listar(ctx: TenantContext) {
    return prisma.categoriaProduto.findMany({ where: tenantWhere(ctx), orderBy: { nome: "asc" } });
  }
  async buscarPorId(ctx: TenantContext, id: string) {
    return prisma.categoriaProduto.findFirst({ where: { id, ...tenantWhere(ctx) } });
  }
  async criar(ctx: TenantContext, data: CreateCategoriaDto) {
    return prisma.categoriaProduto.create({ data: { nome: data.nome, descricao: data.descricao, ...tenantCreate(ctx) } });
  }
  async atualizar(ctx: TenantContext, id: string, data: UpdateCategoriaDto) {
    const atual = await this.buscarPorId(ctx, id);
    if (!atual) throw new Error("Categoria não encontrada");
    return prisma.categoriaProduto.update({ where: { id }, data });
  }
}
