import { prisma } from "../../core/prisma/prisma.js";
import { TenantContext, tenantCreate, tenantWhere } from "../../core/tenant.js";
import { CreateMarcaDto, UpdateMarcaDto } from "./marca.types.js";

export class MarcaService {
  async listar(ctx: TenantContext) { return prisma.marca.findMany({ where: tenantWhere(ctx), orderBy: { nome: "asc" } }); }
  async buscarPorId(ctx: TenantContext, id: string) { return prisma.marca.findFirst({ where: { id, ...tenantWhere(ctx) } }); }
  async criar(ctx: TenantContext, data: CreateMarcaDto) { return prisma.marca.create({ data: { ...data, ...tenantCreate(ctx) } }); }
  async atualizar(ctx: TenantContext, id: string, data: UpdateMarcaDto) {
    const atual = await this.buscarPorId(ctx, id);
    if (!atual) throw new Error("Marca não encontrada");
    return prisma.marca.update({ where: { id }, data });
  }
  async excluir(ctx: TenantContext, id: string) {
    const atual = await this.buscarPorId(ctx, id);
    if (!atual) throw new Error("Marca não encontrada");
    return prisma.marca.delete({ where: { id } });
  }
}
