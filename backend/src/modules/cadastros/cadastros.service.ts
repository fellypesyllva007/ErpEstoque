import { prisma } from "../../core/prisma/prisma.js";
import { TenantContext, tenantCreate, tenantWhere } from "../../core/tenant.js";

export class CadastrosService {
  empresas() { return prisma.empresa.findMany({ include: { filiais: true }, orderBy: { nome: "asc" } }); }
  filiais(ctx: TenantContext) { return prisma.filial.findMany({ where: { empresaId: ctx.empresaId }, orderBy: { nome: "asc" } }); }
  unidades(ctx: TenantContext) { return prisma.unidadeMedida.findMany({ where: tenantWhere(ctx), orderBy: { sigla: "asc" } }); }
  criarUnidade(ctx: TenantContext, data: any) { return prisma.unidadeMedida.create({ data: { ...data, ...tenantCreate(ctx) } }); }
  condicoes(ctx: TenantContext) { return prisma.condicaoPagamento.findMany({ where: tenantWhere(ctx), orderBy: { nome: "asc" } }); }
  criarCondicao(ctx: TenantContext, data: any) { return prisma.condicaoPagamento.create({ data: { ...data, ...tenantCreate(ctx) } }); }
  formas(ctx: TenantContext) { return prisma.formaPagamento.findMany({ where: tenantWhere(ctx), orderBy: { nome: "asc" } }); }
  criarForma(ctx: TenantContext, data: any) { return prisma.formaPagamento.create({ data: { ...data, ...tenantCreate(ctx) } }); }
  centros(ctx: TenantContext) { return prisma.centroCusto.findMany({ where: tenantWhere(ctx), orderBy: { codigo: "asc" } }); }
  criarCentro(ctx: TenantContext, data: any) { return prisma.centroCusto.create({ data: { ...data, ...tenantCreate(ctx) } }); }
  plano(ctx: TenantContext) { return prisma.contaContabil.findMany({ where: tenantWhere(ctx), orderBy: { codigo: "asc" } }); }
  criarConta(ctx: TenantContext, data: any) { return prisma.contaContabil.create({ data: { ...data, ...tenantCreate(ctx) } }); }
}
