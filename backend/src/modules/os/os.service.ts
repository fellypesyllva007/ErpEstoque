import { prisma } from "../../core/prisma/prisma.js";
import { registrarAuditoria } from "../../core/auditoria.js";
import { TenantContext, tenantCreate, tenantWhere } from "../../core/tenant.js";
import { CreateOSDto, UpdateOSDto, AdicionarPecaDto } from "./os.types.js";
import { assertEstoqueDisponivel, calcularEstoquePosterior } from "../../core/business-rules.js";

function gerarNumeroOS(): string {
  const d = new Date();
  return `OS-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}-${Math.floor(Math.random()*99999).toString().padStart(5,'0')}`;
}

export class OSService {
  async listar(ctx: TenantContext, status?: string) {
    return prisma.ordemServico.findMany({
      where: { ...tenantWhere(ctx), ...(status ? { status } : {}) },
      include: { cliente: { select: { nome: true, telefone: true } }, tecnico: { select: { nome: true } }, itens: { include: { produto: { select: { nome: true } } } } },
      orderBy: { criadoEm: "desc" },
    });
  }

  async buscarPorId(ctx: TenantContext, id: string) {
    return prisma.ordemServico.findFirst({
      where: { id, ...tenantWhere(ctx) },
      include: { cliente: true, tecnico: { select: { nome: true } }, itens: { include: { produto: { select: { nome: true, codigoInterno: true } } } } },
    });
  }

  async criar(ctx: TenantContext, data: CreateOSDto, usuarioId: string) {
    await prisma.cliente.findFirstOrThrow({ where: { id: data.clienteId, ...tenantWhere(ctx) } });
    if (data.tecnicoId) await prisma.usuario.findFirstOrThrow({ where: { id: data.tecnicoId, ...tenantWhere(ctx) } });
    const os = await prisma.ordemServico.create({
      data: { ...data, ...tenantCreate(ctx), numero: gerarNumeroOS(), status: "ABERTA" },
      include: { cliente: { select: { nome: true } } },
    });
    await registrarAuditoria({ usuarioId, tabela: "ordens_servico", registro: os.id, acao: "CRIAR", dadosDepois: os, tenant: ctx });
    return os;
  }

  async atualizar(ctx: TenantContext, id: string, data: UpdateOSDto, usuarioId: string) {
    const antes = await this.buscarPorId(ctx, id);
    if (!antes) throw new Error("OS não encontrada");
    const os = await prisma.ordemServico.update({
      where: { id },
      data: { ...data, dataPrevisao: data.dataPrevisao ? new Date(data.dataPrevisao) : undefined, dataConclusao: data.status === "CONCLUIDA" ? new Date() : undefined },
    });
    await registrarAuditoria({ usuarioId, tabela: "ordens_servico", registro: id, acao: "ATUALIZAR", dadosAntes: antes, dadosDepois: os, tenant: ctx });
    return os;
  }

  async adicionarPeca(ctx: TenantContext, ordemId: string, data: AdicionarPecaDto, usuarioId: string) {
    await prisma.ordemServico.findFirstOrThrow({ where: { id: ordemId, ...tenantWhere(ctx) } });
    const produto = await prisma.produto.findFirstOrThrow({ where: { id: data.produtoId, ...tenantWhere(ctx) } });
    assertEstoqueDisponivel(produto, data.quantidade);

    const item = await prisma.$transaction(async (tx) => {
      const it = await tx.itemOS.create({ data: { ordemId, produtoId: data.produtoId, quantidade: data.quantidade, precoUnitario: data.precoUnitario } });
      const ant = produto.estoqueAtual;
      const pos = calcularEstoquePosterior(ant, data.quantidade, "SAIDA");
      await tx.produto.update({ where: { id: data.produtoId }, data: { estoqueAtual: pos } });
      await tx.movimentacaoEstoque.create({ data: { ...tenantCreate(ctx), produtoId: data.produtoId, tipo: "SAIDA", quantidade: data.quantidade, estoqueAnterior: ant, estoquePosterior: pos, observacao: `Peça utilizada em OS ${ordemId}` } });
      return it;
    });

    await registrarAuditoria({ usuarioId, tabela: "itens_os", registro: item.id, acao: "ADICIONAR_PECA", tenant: ctx });
    return item;
  }

  async removerPeca(ctx: TenantContext, itemId: string, usuarioId: string) {
    const item = await prisma.itemOS.findFirstOrThrow({ where: { id: itemId, ordem: tenantWhere(ctx) } });
    await prisma.$transaction(async (tx) => {
      await tx.itemOS.delete({ where: { id: itemId } });
      const prod = await tx.produto.findFirstOrThrow({ where: { id: item.produtoId, ...tenantWhere(ctx) } });
      const pos = calcularEstoquePosterior(prod.estoqueAtual, item.quantidade, "ENTRADA");
      await tx.produto.update({ where: { id: item.produtoId }, data: { estoqueAtual: pos } });
      await tx.movimentacaoEstoque.create({ data: { ...tenantCreate(ctx), produtoId: item.produtoId, tipo: "ENTRADA", quantidade: item.quantidade, estoqueAnterior: prod.estoqueAtual, estoquePosterior: pos, observacao: `Estorno peça removida OS ${item.ordemId}` } });
    });
    await registrarAuditoria({ usuarioId, tabela: "itens_os", registro: itemId, acao: "REMOVER_PECA", tenant: ctx });
    return { message: "Peça removida e estoque estornado" };
  }

  async contarPorStatus(ctx: TenantContext) {
    return prisma.ordemServico.groupBy({ by: ["status"], where: tenantWhere(ctx), _count: { id: true } });
  }
}
