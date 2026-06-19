import { prisma } from "../../core/prisma/prisma.js";
import { registrarAuditoria } from "../../core/auditoria.js";
import { TenantContext, tenantCreate, tenantWhere } from "../../core/tenant.js";
import { MovimentacaoDto } from "./estoque.types.js";

export class EstoqueService {
  async registrarMovimentacao(data: MovimentacaoDto, ctx: TenantContext) {
    const produto = await prisma.produto.findFirstOrThrow({ where: { id: data.produtoId, ...tenantWhere(ctx) } });

    const estoqueAnterior = produto.estoqueAtual;
    let estoquePosterior: number;

    if (data.tipo === "ENTRADA") {
      estoquePosterior = estoqueAnterior + data.quantidade;
    } else if (data.tipo === "SAIDA") {
      if (estoqueAnterior < data.quantidade) throw new Error("Estoque insuficiente");
      estoquePosterior = estoqueAnterior - data.quantidade;
    } else {
      estoquePosterior = data.quantidade;
    }

    const [movimentacao] = await prisma.$transaction([
      prisma.movimentacaoEstoque.create({
        data: {
          ...tenantCreate(ctx),
          produtoId: data.produtoId,
          tipo: data.tipo,
          quantidade: data.quantidade,
          estoqueAnterior,
          estoquePosterior,
          observacao: data.observacao,
        },
      }),
      prisma.produto.update({
        where: { id: data.produtoId },
        data: { estoqueAtual: estoquePosterior },
      }),
    ]);

    return movimentacao;
  }

  async listarMovimentacoes(ctx: TenantContext, produtoId?: string) {
    return prisma.movimentacaoEstoque.findMany({
      where: { ...tenantWhere(ctx), ...(produtoId ? { produtoId } : {}) },
      include: { produto: { select: { nome: true, codigoInterno: true } } },
      orderBy: { criadoEm: "desc" },
      take: 200,
    });
  }

  async resumoPorProduto(ctx: TenantContext, produtoId: string) {
    await prisma.produto.findFirstOrThrow({ where: { id: produtoId, ...tenantWhere(ctx) } });
    return prisma.movimentacaoEstoque.groupBy({
      by: ["tipo"],
      where: { produtoId, ...tenantWhere(ctx) },
      _sum: { quantidade: true },
    });
  }
  async saldoDisponivel(ctx: TenantContext, produtoId: string) {
    const produto = await prisma.produto.findFirstOrThrow({ where: { id: produtoId, ...tenantWhere(ctx) } });
    const reservas = await prisma.reservaEstoque.aggregate({ where: { ...tenantWhere(ctx), produtoId, status: "ATIVA" }, _sum: { quantidade: true } });
    const reservado = reservas._sum.quantidade ?? 0;
    return { produtoId, estoqueFisico: produto.estoqueAtual, reservado, disponivel: produto.estoqueAtual - reservado };
  }

  async reservar(ctx: TenantContext, data: any) {
    const saldo = await this.saldoDisponivel(ctx, data.produtoId);
    if (saldo.disponivel < Number(data.quantidade)) throw new Error("Estoque disponível insuficiente para reserva");
    return prisma.reservaEstoque.create({ data: { ...tenantCreate(ctx), produtoId: data.produtoId, origem: data.origem, referenciaId: data.referenciaId, quantidade: Number(data.quantidade) } });
  }

  kardex(ctx: TenantContext, produtoId: string) {
    return prisma.movimentacaoEstoque.findMany({ where: { ...tenantWhere(ctx), produtoId }, orderBy: { criadoEm: "asc" } });
  }

  async abrirInventario(ctx: TenantContext, data: any) {
    const inventario = await prisma.inventarioEstoque.create({ data: { ...tenantCreate(ctx), tipo: data.tipo ?? "GERAL", descricao: data.descricao, criadoPor: ctx.usuarioId } });
    if (Array.isArray(data.produtos)) {
      const produtos = await prisma.produto.findMany({ where: { ...tenantWhere(ctx), id: { in: data.produtos } } });
      await prisma.itemInventarioEstoque.createMany({ data: produtos.map((p) => ({ ...tenantCreate(ctx), inventarioId: inventario.id, produtoId: p.id, estoqueSistema: p.estoqueAtual, estoqueContado: p.estoqueAtual, divergencia: 0 })) });
    }
    return inventario;
  }

  async contarInventario(ctx: TenantContext, itemId: string, estoqueContado: number, observacao?: string) {
    const item = await prisma.itemInventarioEstoque.findFirstOrThrow({ where: { id: itemId, ...tenantWhere(ctx) } });
    return prisma.itemInventarioEstoque.update({ where: { id: itemId }, data: { estoqueContado, divergencia: estoqueContado - item.estoqueSistema, observacao, status: estoqueContado === item.estoqueSistema ? "CONFERIDO" : "DIVERGENTE" } });
  }

  async listarInventarios(ctx: TenantContext) { return prisma.inventarioEstoque.findMany({ where: tenantWhere(ctx), orderBy: { iniciadoEm: "desc" } }); }

  async itensInventario(ctx: TenantContext, inventarioId: string) {
    return prisma.itemInventarioEstoque.findMany({ where: { ...tenantWhere(ctx), inventarioId }, orderBy: { criadoEm: "asc" } });
  }

  async aprovarInventario(ctx: TenantContext, inventarioId: string) {
    const inventario = await prisma.inventarioEstoque.findFirstOrThrow({ where: { id: inventarioId, ...tenantWhere(ctx) } });
    if (inventario.status === "ENCERRADO") throw new Error("Inventário já encerrado");
    const itens = await prisma.itemInventarioEstoque.findMany({ where: { inventarioId, ...tenantWhere(ctx) } });

    const encerrado = await prisma.$transaction(async (tx) => {
      for (const item of itens.filter((i) => i.divergencia !== 0)) {
        const prod = await tx.produto.findFirstOrThrow({ where: { id: item.produtoId, ...tenantWhere(ctx) } });
        await tx.produto.update({ where: { id: item.produtoId }, data: { estoqueAtual: item.estoqueContado } });
        await tx.movimentacaoEstoque.create({
          data: { ...tenantCreate(ctx), produtoId: item.produtoId, tipo: "AJUSTE", quantidade: item.estoqueContado, estoqueAnterior: prod.estoqueAtual, estoquePosterior: item.estoqueContado, observacao: `Ajuste aprovado pelo inventário ${inventarioId}` },
        });
        await tx.itemInventarioEstoque.update({ where: { id: item.id }, data: { status: "APROVADO" } });
      }
      return tx.inventarioEstoque.update({ where: { id: inventarioId }, data: { status: "ENCERRADO", encerradoEm: new Date(), aprovadoPor: ctx.usuarioId } });
    });

    await registrarAuditoria({ tenant: ctx, usuarioId: ctx.usuarioId, tabela: "inventarios_estoque", registro: inventarioId, acao: "APROVAR_DIVERGENCIAS", dadosDepois: encerrado });
    return encerrado;
  }

  async criarTransferencia(ctx: TenantContext, data: any) {
    await this.saldoDisponivel(ctx, data.produtoId).then((s) => { if (s.disponivel < Number(data.quantidade)) throw new Error("Estoque insuficiente para transferência"); });
    return prisma.transferenciaEstoque.create({ data: { empresaId: ctx.empresaId, filialOrigemId: ctx.filialId, filialDestinoId: data.filialDestinoId, produtoId: data.produtoId, quantidade: Number(data.quantidade), observacao: data.observacao } });
  }

  async enviarTransferencia(ctx: TenantContext, id: string) {
    const transf = await prisma.transferenciaEstoque.findFirstOrThrow({ where: { id, empresaId: ctx.empresaId, filialOrigemId: ctx.filialId } });
    if (transf.status !== "PENDENTE_SAIDA") throw new Error("Transferência não está pendente de saída");
    await this.registrarMovimentacao({ produtoId: transf.produtoId, tipo: "SAIDA", quantidade: transf.quantidade, observacao: `Transferência ${id}` }, ctx);
    return prisma.transferenciaEstoque.update({ where: { id }, data: { status: "EM_TRANSITO", enviadoEm: new Date() } });
  }

  async receberTransferencia(ctx: TenantContext, id: string) {
    const transf = await prisma.transferenciaEstoque.findFirstOrThrow({ where: { id, empresaId: ctx.empresaId, filialDestinoId: ctx.filialId } });
    if (transf.status !== "EM_TRANSITO") throw new Error("Transferência não está em trânsito");
    await this.registrarMovimentacao({ produtoId: transf.produtoId, tipo: "ENTRADA", quantidade: transf.quantidade, observacao: `Recebimento transferência ${id}` }, ctx);
    return prisma.transferenciaEstoque.update({ where: { id }, data: { status: "RECEBIDA", recebidoEm: new Date() } });
  }

  listarTransferencias(ctx: TenantContext) {
    return prisma.transferenciaEstoque.findMany({
      where: { empresaId: ctx.empresaId, OR: [{ filialOrigemId: ctx.filialId }, { filialDestinoId: ctx.filialId }] },
      orderBy: { criadoEm: "desc" },
      take: 200,
    });
  }

}
