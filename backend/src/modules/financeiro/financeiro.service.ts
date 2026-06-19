import { prisma } from "../../core/prisma/prisma.js";
import { registrarAuditoria } from "../../core/auditoria.js";
import { TenantContext, tenantCreate, tenantWhere } from "../../core/tenant.js";
import { calcularAgingContas, consolidarDreGerencial } from "../../core/business-rules.js";

const hoje = () => new Date();

export class FinanceiroService {
  listarReceber(ctx: TenantContext) {
    return prisma.contaReceber.findMany({ where: tenantWhere(ctx), orderBy: { vencimento: "asc" } });
  }

  async criarReceber(ctx: TenantContext, data: any) {
    await this.validarPeriodoAberto(ctx, new Date(data.vencimento));
    return prisma.contaReceber.create({
      data: { ...data, vencimento: new Date(data.vencimento), ...tenantCreate(ctx) },
    });
  }

  async baixarReceber(ctx: TenantContext, id: string, valor: number) {
    await this.validarPeriodoAberto(ctx);
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

  async criarPagar(ctx: TenantContext, data: any) {
    await this.validarPeriodoAberto(ctx, new Date(data.vencimento));
    return prisma.contaPagar.create({
      data: { ...data, vencimento: new Date(data.vencimento), ...tenantCreate(ctx) },
    });
  }

  async baixarPagar(ctx: TenantContext, id: string, valor: number) {
    await this.validarPeriodoAberto(ctx);
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
    const entradasProjetadas = receber.map((c) => ({ data: c.vencimento, descricao: c.descricao, valor: Number(c.valor) - Number(c.valorBaixado), origem: "RECEBER" }));
    const saidasProjetadas = pagar.map((c) => ({ data: c.vencimento, descricao: c.descricao, valor: Number(c.valor) - Number(c.valorBaixado), origem: "PAGAR" }));
    const realizado = caixa.map((m) => ({ data: m.dataMovimento, descricao: m.descricao, valor: Number(m.valor), tipo: m.tipo, origem: m.origem }));
    return { saldoCaixa, aReceber, aPagar, saldoProjetado: saldoCaixa + aReceber - aPagar, realizado, projetado: { entradas: entradasProjetadas, saidas: saidasProjetadas }, geradoEm: hoje() };
  }

  async inadimplencia(ctx: TenantContext) {
    const hojeRef = new Date(); hojeRef.setHours(0, 0, 0, 0);
    const contas = await prisma.contaReceber.findMany({ where: { ...tenantWhere(ctx), status: { in: ["ABERTO", "PARCIAL"] } }, orderBy: { vencimento: "asc" } });
    const vencidas = contas.filter((c) => c.vencimento < hojeRef);
    const aVencer = contas.filter((c) => c.vencimento >= hojeRef);
    const soma = (lista: typeof contas) => lista.reduce((s, c) => s + Number(c.valor) - Number(c.valorBaixado), 0);
    return { vencidas, aVencer, totalVencido: soma(vencidas), totalAVencer: soma(aVencer), quantidadeVencidas: vencidas.length, quantidadeAVencer: aVencer.length, geradoEm: new Date() };
  }

  private periodo(data = new Date()) { return { ano: data.getFullYear(), mes: data.getMonth() + 1 }; }

  async validarPeriodoAberto(ctx: TenantContext, data = new Date()) {
    const { ano, mes } = this.periodo(data);
    const periodo = await prisma.periodoFinanceiro.findUnique({ where: { empresaId_filialId_ano_mes: { ...tenantWhere(ctx), ano, mes } } });
    if (periodo?.status === "FECHADO") throw new Error(`Período financeiro ${mes}/${ano} fechado`);
    return periodo;
  }

  async dre(ctx: TenantContext, dataInicio?: string, dataFim?: string, regime: "CAIXA" | "COMPETENCIA" = "CAIXA") {
    const inicio = dataInicio ? new Date(dataInicio) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const fim = dataFim ? new Date(`${dataFim}T23:59:59`) : new Date();
    if (regime === "COMPETENCIA") {
      const lancamentos = await prisma.lancamentoContabil.findMany({ where: { ...tenantWhere(ctx), estornado: false, dataCompetencia: { gte: inicio, lte: fim } } });
      const receitas = lancamentos.filter((m) => m.origem.includes("RECEBER") || m.origem.includes("VENDA")).reduce((s, m) => s + Number(m.valor), 0);
      const despesas = lancamentos.filter((m) => m.origem.includes("PAGAR") || m.origem.includes("COMPRA")).reduce((s, m) => s + Number(m.valor), 0);
      const gerencial = consolidarDreGerencial(lancamentos.map((m) => ({ tipo: m.origem.includes("RECEBER") || m.origem.includes("VENDA") ? "RECEITA" : "DESPESA", categoria: m.centroCustoId, valor: Number(m.valor) })));
      return { periodo: { dataInicio: inicio, dataFim: fim }, regime, receitas, despesas, resultado: receitas - despesas, gerencial };
    }
    const caixa = await prisma.movimentoCaixa.findMany({ where: { ...tenantWhere(ctx), estornado: false, dataMovimento: { gte: inicio, lte: fim } } });
    const receitas = caixa.filter((m) => m.tipo === "ENTRADA").reduce((s, m) => s + Number(m.valor), 0);
    const despesas = caixa.filter((m) => m.tipo === "SAIDA").reduce((s, m) => s + Number(m.valor), 0);
    const gerencial = consolidarDreGerencial(caixa.map((m) => ({ tipo: m.tipo === "ENTRADA" ? "RECEITA" : "DESPESA", categoria: m.origem, valor: Number(m.valor) })));
    return { periodo: { dataInicio: inicio, dataFim: fim }, regime, receitas, despesas, resultado: receitas - despesas, gerencial };
  }

  balancete(ctx: TenantContext, dataInicio?: string, dataFim?: string) {
    const inicio = dataInicio ? new Date(dataInicio) : new Date(new Date().getFullYear(), 0, 1);
    const fim = dataFim ? new Date(`${dataFim}T23:59:59`) : new Date();
    return prisma.lancamentoContabil.groupBy({ by: ["contaDebitoId", "contaCreditoId"], where: { ...tenantWhere(ctx), estornado: false, dataCompetencia: { gte: inicio, lte: fim } }, _sum: { valor: true }, _count: { id: true } });
  }

  razao(ctx: TenantContext, contaId: string) {
    return prisma.lancamentoContabil.findMany({ where: { ...tenantWhere(ctx), OR: [{ contaDebitoId: contaId }, { contaCreditoId: contaId }] }, orderBy: { dataCompetencia: "asc" } });
  }

  diario(ctx: TenantContext, dataInicio?: string, dataFim?: string) {
    const inicio = dataInicio ? new Date(dataInicio) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const fim = dataFim ? new Date(`${dataFim}T23:59:59`) : new Date();
    return prisma.lancamentoContabil.findMany({ where: { ...tenantWhere(ctx), dataCompetencia: { gte: inicio, lte: fim } }, orderBy: [{ dataCompetencia: "asc" }, { criadoEm: "asc" }] });
  }


  centrosCusto(ctx: TenantContext) { return prisma.centroCusto.findMany({ where: tenantWhere(ctx), orderBy: { codigo: "asc" } }); }
  criarCentroCusto(ctx: TenantContext, data: any) { return prisma.centroCusto.create({ data: { ...tenantCreate(ctx), codigo: data.codigo, nome: data.nome, ativo: data.ativo ?? true } }); }
  planoContas(ctx: TenantContext) { return prisma.contaContabil.findMany({ where: tenantWhere(ctx), orderBy: { codigo: "asc" } }); }
  criarContaContabil(ctx: TenantContext, data: any) { return prisma.contaContabil.create({ data: { ...tenantCreate(ctx), codigo: data.codigo, nome: data.nome, tipo: data.tipo, ativo: data.ativo ?? true } }); }
  contasRecorrentes(ctx: TenantContext) { return prisma.contaRecorrente.findMany({ where: tenantWhere(ctx), orderBy: { criadoEm: "desc" } }); }
  criarContaRecorrente(ctx: TenantContext, data: any) { return prisma.contaRecorrente.create({ data: { ...tenantCreate(ctx), ...data, valor: Number(data.valor), proximaGeracao: data.proximaGeracao ? new Date(data.proximaGeracao) : undefined } }); }

  async agingReceber(ctx: TenantContext) {
    const contas = await prisma.contaReceber.findMany({ where: { ...tenantWhere(ctx), status: { in: ["ABERTO", "PARCIAL"] } } });
    return { buckets: calcularAgingContas(contas.map((c) => ({ vencimento: c.vencimento, valor: Number(c.valor), valorBaixado: Number(c.valorBaixado) }))), geradoEm: new Date() };
  }

  async estornarMovimentoCaixa(ctx: TenantContext, id: string, motivo?: string) {
    const mov = await prisma.movimentoCaixa.findFirstOrThrow({ where: { id, ...tenantWhere(ctx), estornado: false } });
    await this.validarPeriodoAberto(ctx, mov.dataMovimento);
    const estornado = await prisma.movimentoCaixa.update({ where: { id }, data: { estornado: true } });
    await registrarAuditoria({ tenant: ctx, usuarioId: ctx.usuarioId, tabela: "movimentos_caixa", registro: id, acao: "ESTORNO_FINANCEIRO", dadosAntes: mov, dadosDepois: { ...estornado, motivo } });
    return estornado;
  }

  async fecharPeriodo(ctx: TenantContext, ano: number, mes: number, observacao?: string) {
    const periodo = await prisma.periodoFinanceiro.upsert({
      where: { empresaId_filialId_ano_mes: { ...tenantWhere(ctx), ano, mes } },
      create: { ...tenantCreate(ctx), ano, mes, status: "FECHADO", fechadoEm: new Date(), fechadoPor: ctx.usuarioId, observacao },
      update: { status: "FECHADO", fechadoEm: new Date(), fechadoPor: ctx.usuarioId, observacao },
    });
    await registrarAuditoria({ tenant: ctx, usuarioId: ctx.usuarioId, tabela: "periodos_financeiros", registro: periodo.id, acao: "FECHAMENTO_MENSAL", dadosDepois: periodo });
    return periodo;
  }

  async conciliacao(ctx: TenantContext, data: any) {
    return prisma.conciliacaoBancaria.create({ data: { ...data, dataExtrato: new Date(data.dataExtrato), ...tenantCreate(ctx) } });
  }

  listarConciliacoes(ctx: TenantContext) { return prisma.conciliacaoBancaria.findMany({ where: tenantWhere(ctx), orderBy: { dataExtrato: "desc" } }); }

  async aprovarPagamento(ctx: TenantContext, contaPagarId: string, motivo?: string) {
    const aprovacao = await prisma.aprovacaoPagamento.create({ data: { ...tenantCreate(ctx), contaPagarId, status: "APROVADO", solicitadoPor: ctx.usuarioId, aprovadoPor: ctx.usuarioId, aprovadoEm: new Date(), motivo } });
    await registrarAuditoria({ tenant: ctx, usuarioId: ctx.usuarioId, tabela: "aprovacoes_pagamento", registro: aprovacao.id, acao: "APROVACAO_PAGAMENTO", dadosDepois: aprovacao });
    return aprovacao;
  }
}
