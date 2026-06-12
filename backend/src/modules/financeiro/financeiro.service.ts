import { prisma } from "../../core/prisma/prisma.js";
import { TenantContext, tenantCreate, tenantWhere } from "../../core/tenant.js";

const hoje = () => new Date();

export class FinanceiroService {
  listarReceber(ctx: TenantContext) {
    return prisma.contaReceber.findMany({ where: tenantWhere(ctx), orderBy: { vencimento: "asc" } });
  }

  criarReceber(ctx: TenantContext, data: any) {
    return prisma.contaReceber.create({
      data: { ...data, vencimento: new Date(data.vencimento), ...tenantCreate(ctx) },
    });
  }

  async baixarReceber(ctx: TenantContext, id: string, valor: number) {
    const conta = await prisma.contaReceber.findFirstOrThrow({ where: { id, ...tenantWhere(ctx) } });
    const baixado = Number(conta.valorBaixado) + valor;
    const status = baixado >= Number(conta.valor) ? "BAIXADO" : "PARCIAL";
    return prisma.$transaction(async (tx) => {
      const atualizada = await tx.contaReceber.update({ where: { id }, data: { valorBaixado: baixado, status } });
      await tx.movimentoCaixa.create({ data: { ...tenantCreate(ctx), tipo: "ENTRADA", origem: "CONTA_RECEBER", referenciaId: id, descricao: conta.descricao, valor } });
      return atualizada;
    });
  }

  listarPagar(ctx: TenantContext) {
    return prisma.contaPagar.findMany({ where: tenantWhere(ctx), orderBy: { vencimento: "asc" } });
  }

  criarPagar(ctx: TenantContext, data: any) {
    return prisma.contaPagar.create({
      data: { ...data, vencimento: new Date(data.vencimento), ...tenantCreate(ctx) },
    });
  }

  async baixarPagar(ctx: TenantContext, id: string, valor: number) {
    const conta = await prisma.contaPagar.findFirstOrThrow({ where: { id, ...tenantWhere(ctx) } });
    const baixado = Number(conta.valorBaixado) + valor;
    const status = baixado >= Number(conta.valor) ? "BAIXADO" : "PARCIAL";
    return prisma.$transaction(async (tx) => {
      const atualizada = await tx.contaPagar.update({ where: { id }, data: { valorBaixado: baixado, status } });
      await tx.movimentoCaixa.create({ data: { ...tenantCreate(ctx), tipo: "SAIDA", origem: "CONTA_PAGAR", referenciaId: id, descricao: conta.descricao, valor } });
      return atualizada;
    });
  }

  movimentosCaixa(ctx: TenantContext) {
    return prisma.movimentoCaixa.findMany({ where: tenantWhere(ctx), orderBy: { dataMovimento: "desc" }, take: 300 });
  }

  async fluxoCaixa(ctx: TenantContext) {
    const [receber, pagar, caixa] = await Promise.all([
      prisma.contaReceber.findMany({ where: { ...tenantWhere(ctx), status: { in: ["ABERTO", "PARCIAL"] } } }),
      prisma.contaPagar.findMany({ where: { ...tenantWhere(ctx), status: { in: ["ABERTO", "PARCIAL"] } } }),
      prisma.movimentoCaixa.findMany({ where: tenantWhere(ctx) }),
    ]);
    const saldoCaixa = caixa.reduce((s, m) => s + (m.tipo === "ENTRADA" ? Number(m.valor) : -Number(m.valor)), 0);
    const aReceber = receber.reduce((s, c) => s + Number(c.valor) - Number(c.valorBaixado), 0);
    const aPagar = pagar.reduce((s, c) => s + Number(c.valor) - Number(c.valorBaixado), 0);
    return { saldoCaixa, aReceber, aPagar, saldoProjetado: saldoCaixa + aReceber - aPagar, geradoEm: hoje() };
  }

  async dre(ctx: TenantContext) {
    const caixa = await prisma.movimentoCaixa.findMany({ where: tenantWhere(ctx) });
    const receitas = caixa.filter((m) => m.tipo === "ENTRADA").reduce((s, m) => s + Number(m.valor), 0);
    const despesas = caixa.filter((m) => m.tipo === "SAIDA").reduce((s, m) => s + Number(m.valor), 0);
    return { receitas, despesas, resultado: receitas - despesas };
  }
}
