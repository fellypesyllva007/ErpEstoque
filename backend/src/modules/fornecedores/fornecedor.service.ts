import { prisma } from "../../core/prisma/prisma.js";
import { TenantContext, tenantCreate, tenantWhere } from "../../core/tenant.js";
import { CreateFornecedorDto, UpdateFornecedorDto } from "./fornecedor.types.js";

export class FornecedorService {
  async listar(ctx: TenantContext) {
    return prisma.fornecedor.findMany({ where: tenantWhere(ctx), orderBy: { nome: "asc" } });
  }

  async buscarPorId(id: string, ctx: TenantContext) {
    return prisma.fornecedor.findFirst({ where: { id, ...tenantWhere(ctx) } });
  }

  async criar(data: CreateFornecedorDto, ctx: TenantContext) {
    return prisma.fornecedor.create({ data: { ...data, ...tenantCreate(ctx) } });
  }

  async atualizar(id: string, data: UpdateFornecedorDto, ctx: TenantContext) {
    const atual = await this.buscarPorId(id, ctx);
    if (!atual) throw new Error("Fornecedor não encontrado");
    return prisma.fornecedor.update({ where: { id }, data });
  }

  async excluir(id: string, ctx: TenantContext) {
    const atual = await this.buscarPorId(id, ctx);
    if (!atual) throw new Error("Fornecedor não encontrado");
    return prisma.fornecedor.update({ where: { id }, data: { ativo: false } });
  }
}
