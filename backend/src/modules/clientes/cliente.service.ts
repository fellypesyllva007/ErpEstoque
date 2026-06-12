import { prisma } from "../../core/prisma/prisma.js";
import { TenantContext, tenantCreate, tenantWhere } from "../../core/tenant.js";
import { CreateClienteDto, UpdateClienteDto } from "./cliente.types.js";

export class ClienteService {
  async listar(ctx: TenantContext) {
    return prisma.cliente.findMany({ where: tenantWhere(ctx), orderBy: { nome: "asc" } });
  }

  async buscarPorId(id: string, ctx: TenantContext) {
    return prisma.cliente.findFirst({ where: { id, ...tenantWhere(ctx) } });
  }

  async criar(data: CreateClienteDto, ctx: TenantContext) {
    return prisma.cliente.create({ data: { ...data, ...tenantCreate(ctx) } });
  }

  async atualizar(id: string, data: UpdateClienteDto, ctx: TenantContext) {
    const atual = await this.buscarPorId(id, ctx);
    if (!atual) throw new Error("Cliente não encontrado");
    return prisma.cliente.update({ where: { id }, data });
  }

  async excluir(id: string, ctx: TenantContext) {
    const atual = await this.buscarPorId(id, ctx);
    if (!atual) throw new Error("Cliente não encontrado");
    return prisma.cliente.update({ where: { id }, data: { ativo: false } });
  }
}
