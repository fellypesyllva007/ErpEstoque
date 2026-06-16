import { prisma } from "../../core/prisma/prisma.js";
import { registrarAuditoria } from "../../core/auditoria.js";
import { TenantContext, tenantCreate, tenantWhere } from "../../core/tenant.js";
import { CreateVendaDto } from "./venda.types.js";
import { assertEstoqueDisponivel, calcularEstoquePosterior, calcularTotalVenda } from "../../core/business-rules.js";

function gerarNumeroVenda() {
  const d = new Date();
  return `VD-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}-${Math.floor(Math.random()*99999).toString().padStart(5,'0')}`;
}

function periodoWhere(dataInicio?: string, dataFim?: string) {
  return dataInicio || dataFim ? { criadoEm: { ...(dataInicio ? { gte: new Date(dataInicio) } : {}), ...(dataFim ? { lte: new Date(dataFim + "T23:59:59") } : {}) } } : {};
}

export class VendaService {
  async listar(ctx: TenantContext, status?: string, dataInicio?: string, dataFim?: string) {
    return prisma.venda.findMany({
      where: { ...tenantWhere(ctx), ...(status ? { status } : {}), ...periodoWhere(dataInicio, dataFim) },
      include: {
        cliente: { select: { nome: true } },
        itens: { include: { produto: { select: { nome: true, codigoInterno: true } } } },
        documentosFiscais: { select: { id: true, modelo: true, numero: true, serie: true, chave: true, statusInterno: true, statusSefaz: true, protocolo: true, ambienteFiscal: true } },
      },
      orderBy: { criadoEm: "desc" },
    });
  }

  async buscarPorId(ctx: TenantContext, id: string) {
    return prisma.venda.findFirst({
      where: { id, ...tenantWhere(ctx) },
      include: {
        cliente: true,
        itens: { include: { produto: { select: { nome: true, codigoInterno: true } } } },
        documentosFiscais: { select: { id: true, modelo: true, numero: true, serie: true, chave: true, statusInterno: true, statusSefaz: true, protocolo: true, ambienteFiscal: true } },
      },
    });
  }

  async criar(ctx: TenantContext, data: CreateVendaDto, usuarioId: string) {
    if (data.clienteId) await prisma.cliente.findFirstOrThrow({ where: { id: data.clienteId, ...tenantWhere(ctx) } });
    for (const item of data.itens) {
      const prod = await prisma.produto.findFirstOrThrow({ where: { id: item.produtoId, ...tenantWhere(ctx) } });
      assertEstoqueDisponivel(prod, item.quantidade);
    }

    const descontoGlobal = data.desconto ?? 0;
    const valorTotal = calcularTotalVenda(data.itens, descontoGlobal);

    const venda = await prisma.$transaction(async (tx) => {
      const v = await tx.venda.create({
        data: {
          ...tenantCreate(ctx),
          numero: gerarNumeroVenda(),
          clienteId: data.clienteId,
          formaPagamento: data.formaPagamento,
          desconto: descontoGlobal,
          observacoes: data.observacoes,
          valorTotal,
          status: "CONCLUIDA",
          itens: { create: data.itens.map(i => ({ produtoId: i.produtoId, quantidade: i.quantidade, precoUnitario: i.precoUnitario, desconto: i.desconto ?? 0 })) },
        },
        include: { itens: true, cliente: { select: { nome: true } } },
      });

      for (const item of data.itens) {
        const prod = await tx.produto.findFirstOrThrow({ where: { id: item.produtoId, ...tenantWhere(ctx) } });
        const anterior = prod.estoqueAtual;
        const posterior = calcularEstoquePosterior(anterior, item.quantidade, "SAIDA");
        await tx.produto.update({ where: { id: item.produtoId }, data: { estoqueAtual: posterior } });
        await tx.movimentacaoEstoque.create({ data: { ...tenantCreate(ctx), produtoId: item.produtoId, tipo: "SAIDA", quantidade: item.quantidade, estoqueAnterior: anterior, estoquePosterior: posterior, observacao: `Venda ${v.numero}` } });
      }

      await tx.contaReceber.create({ data: { ...tenantCreate(ctx), clienteId: data.clienteId, vendaId: v.id, descricao: `Venda ${v.numero}`, valor: valorTotal, vencimento: new Date() } });
      return v;
    });

    await registrarAuditoria({ usuarioId, tabela: "vendas", registro: venda.id, acao: "CRIAR", dadosDepois: venda, tenant: ctx });
    return venda;
  }

  async cancelar(ctx: TenantContext, id: string, usuarioId: string) {
    const venda = await prisma.venda.findFirstOrThrow({ where: { id, ...tenantWhere(ctx) }, include: { itens: true } });
    if (venda.status === "CANCELADA") throw new Error("Venda já cancelada");

    await prisma.$transaction(async (tx) => {
      await tx.venda.update({ where: { id }, data: { status: "CANCELADA" } });
      await tx.contaReceber.updateMany({ where: { vendaId: id, ...tenantWhere(ctx), status: { not: "BAIXADO" } }, data: { status: "CANCELADO" } });
      for (const item of venda.itens) {
        const prod = await tx.produto.findFirstOrThrow({ where: { id: item.produtoId, ...tenantWhere(ctx) } });
        const anterior = prod.estoqueAtual;
        const posterior = calcularEstoquePosterior(anterior, item.quantidade, "ENTRADA");
        await tx.produto.update({ where: { id: item.produtoId }, data: { estoqueAtual: posterior } });
        await tx.movimentacaoEstoque.create({ data: { ...tenantCreate(ctx), produtoId: item.produtoId, tipo: "ENTRADA", quantidade: item.quantidade, estoqueAnterior: anterior, estoquePosterior: posterior, observacao: `Cancelamento Venda ${venda.numero}` } });
      }
    });

    await registrarAuditoria({ usuarioId, tabela: "vendas", registro: id, acao: "CANCELAR", tenant: ctx });
    return { message: "Venda cancelada, financeiro cancelado e estoque estornado" };
  }

  async rankingMaisVendidos(ctx: TenantContext, periodo: "mes" | "ano" | "30dias") {
    const agora = new Date();
    const inicio = periodo === "mes" ? new Date(agora.getFullYear(), agora.getMonth(), 1) : periodo === "ano" ? new Date(agora.getFullYear(), 0, 1) : new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);
    const itens = await prisma.itemVenda.findMany({
      where: { venda: { ...tenantWhere(ctx), status: "CONCLUIDA", criadoEm: { gte: inicio } } },
      include: { produto: { select: { nome: true, codigoInterno: true, categoria: { select: { nome: true } } } } },
    });
    const mapa: Record<string, { produto: { nome: string; codigoInterno: string; categoria: { nome: string } | null }; qtd: number; faturamento: number }> = {};
    for (const i of itens) {
      if (!mapa[i.produtoId]) mapa[i.produtoId] = { produto: i.produto, qtd: 0, faturamento: 0 };
      mapa[i.produtoId].qtd += i.quantidade;
      mapa[i.produtoId].faturamento += i.quantidade * Number(i.precoUnitario) - Number(i.desconto);
    }
    return Object.values(mapa).sort((a,b) => b.qtd - a.qtd).slice(0, 10);
  }

  async indicadoresHoje(ctx: TenantContext) {
    const hoje = new Date(); hoje.setHours(0,0,0,0);
    const vendas = await prisma.venda.findMany({ where: { ...tenantWhere(ctx), status: "CONCLUIDA", criadoEm: { gte: hoje } }, include: { itens: true } });
    const faturamentoHoje = vendas.reduce((s, v) => s + Number(v.valorTotal), 0);
    return {
      vendasHoje: vendas.length,
      faturamentoHoje,
      quantidade: vendas.length,
      faturamento: faturamentoHoje,
      itensVendidos: vendas.flatMap(v => v.itens).reduce((s, i) => s + i.quantidade, 0),
    };
  }
}
