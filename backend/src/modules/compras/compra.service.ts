import { prisma } from "../../core/prisma/prisma.js";
import { registrarAuditoria } from "../../core/auditoria.js";
import { TenantContext, tenantCreate, tenantWhere } from "../../core/tenant.js";
import { CreatePedidoDto, RecebimentoDto } from "./compra.types.js";
import { calcularEstoquePosterior, calcularStatusPedidoCompra } from "../../core/business-rules.js";

function gerarNumeroPedido() {
  const d = new Date();
  return `PC-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}-${Math.floor(Math.random()*99999).toString().padStart(5,'0')}`;
}

export class CompraService {
  async listar(ctx: TenantContext, status?: string) {
    return prisma.pedidoCompra.findMany({
      where: { ...tenantWhere(ctx), ...(status ? { status } : {}) },
      include: { fornecedor: { select: { nome: true } }, itens: { include: { produto: { select: { nome: true, codigoInterno: true } } } } },
      orderBy: { criadoEm: "desc" },
    });
  }

  async buscarPorId(ctx: TenantContext, id: string) {
    return prisma.pedidoCompra.findFirst({
      where: { id, ...tenantWhere(ctx) },
      include: {
        fornecedor: true,
        itens: { include: { produto: { select: { nome: true, codigoInterno: true, custo: true } } } },
        recebimentos: { include: { itens: { include: { produto: { select: { nome: true } } } } }, orderBy: { criadoEm: "desc" } },
      },
    });
  }

  async criar(ctx: TenantContext, data: CreatePedidoDto, usuarioId: string) {
    await prisma.fornecedor.findFirstOrThrow({ where: { id: data.fornecedorId, ...tenantWhere(ctx) } });
    for (const item of data.itens) {
      await prisma.produto.findFirstOrThrow({ where: { id: item.produtoId, ...tenantWhere(ctx) } });
    }

    const valorTotal = data.itens.reduce((s, i) => s + i.quantidade * i.custoUnitario, 0);

    const pedido = await prisma.$transaction(async (tx) => {
      const p = await tx.pedidoCompra.create({
        data: {
          ...tenantCreate(ctx),
          numero: gerarNumeroPedido(),
          fornecedorId: data.fornecedorId,
          observacoes: data.observacoes,
          valorTotal,
          itens: { create: data.itens.map(i => ({ produtoId: i.produtoId, quantidade: i.quantidade, custoUnitario: i.custoUnitario })) },
        },
        include: { fornecedor: { select: { nome: true } }, itens: true },
      });
      await tx.contaPagar.create({
        data: {
          ...tenantCreate(ctx),
          fornecedorId: data.fornecedorId,
          compraId: p.id,
          descricao: `Pedido de compra ${p.numero}`,
          valor: valorTotal,
          vencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
      return p;
    });

    await registrarAuditoria({ usuarioId, tabela: "pedidos_compra", registro: pedido.id, acao: "CRIAR", dadosDepois: pedido, tenant: ctx });
    return pedido;
  }

  async aprovar(ctx: TenantContext, id: string, usuarioId: string, motivo?: string) {
    const atual = await this.buscarPorId(ctx, id);
    if (!atual) throw new Error("Pedido não encontrado");
    if (["CANCELADO", "RECEBIDO"].includes(atual.status)) throw new Error("Pedido não pode ser aprovado neste status");
    const pedido = await prisma.pedidoCompra.update({ where: { id }, data: { status: "APROVADO" } });
    await registrarAuditoria({ usuarioId, tabela: "pedidos_compra", registro: id, acao: "APROVAR", dadosDepois: { motivo, pedido }, tenant: ctx });
    return pedido;
  }

  async registrarRecebimento(ctx: TenantContext, data: RecebimentoDto, usuarioId: string) {
    const pedido = await prisma.pedidoCompra.findFirstOrThrow({ where: { id: data.pedidoId, ...tenantWhere(ctx) }, include: { itens: true } });

    if (!["APROVADO", "PARCIAL"].includes(pedido.status)) throw new Error("Pedido precisa estar aprovado para receber itens");

    const recebimento = await prisma.$transaction(async (tx) => {
      const rec = await tx.recebimentoCompra.create({
        data: { ...tenantCreate(ctx), pedidoId: data.pedidoId, observacoes: data.observacoes, itens: { create: data.itens.map(i => ({ produtoId: i.produtoId, quantidade: i.quantidade })) } },
        include: { itens: true },
      });

      for (const item of data.itens) {
        const prod = await tx.produto.findFirstOrThrow({ where: { id: item.produtoId, ...tenantWhere(ctx) } });
        const anterior = prod.estoqueAtual;
        const posterior = calcularEstoquePosterior(anterior, item.quantidade, "ENTRADA");

        await tx.produto.update({ where: { id: item.produtoId }, data: { estoqueAtual: posterior } });
        await tx.movimentacaoEstoque.create({ data: { ...tenantCreate(ctx), produtoId: item.produtoId, tipo: "ENTRADA", quantidade: item.quantidade, estoqueAnterior: anterior, estoquePosterior: posterior, observacao: `Recebimento ${rec.id} - Pedido ${pedido.numero}` } });

        const itemPedido = pedido.itens.find(i => i.produtoId === item.produtoId);
        if (itemPedido) await tx.itemPedidoCompra.update({ where: { id: itemPedido.id }, data: { qtdRecebida: { increment: item.quantidade } } });
      }

      const itensAtualizados = await tx.itemPedidoCompra.findMany({ where: { pedidoId: data.pedidoId } });
      await tx.pedidoCompra.update({ where: { id: data.pedidoId }, data: { status: calcularStatusPedidoCompra(itensAtualizados) } });
      return rec;
    });

    await registrarAuditoria({ usuarioId, tabela: "recebimentos_compra", registro: recebimento.id, acao: "RECEBER", tenant: ctx });
    return recebimento;
  }

  async devolver(ctx: TenantContext, pedidoId: string, itens: { produtoId: string; quantidade: number }[], usuarioId: string, observacao?: string) {
    const pedido = await prisma.pedidoCompra.findFirstOrThrow({ where: { id: pedidoId, ...tenantWhere(ctx) } });
    await prisma.$transaction(async (tx) => {
      for (const item of itens) {
        const prod = await tx.produto.findFirstOrThrow({ where: { id: item.produtoId, ...tenantWhere(ctx) } });
        if (prod.estoqueAtual < item.quantidade) throw new Error("Estoque insuficiente para devolução ao fornecedor");
        await tx.produto.update({ where: { id: item.produtoId }, data: { estoqueAtual: prod.estoqueAtual - item.quantidade } });
        await tx.movimentacaoEstoque.create({ data: { ...tenantCreate(ctx), produtoId: item.produtoId, tipo: "SAIDA", quantidade: item.quantidade, estoqueAnterior: prod.estoqueAtual, estoquePosterior: prod.estoqueAtual - item.quantidade, observacao: observacao ?? `Devolução ao fornecedor - Pedido ${pedido.numero}` } });
      }
    });
    await registrarAuditoria({ usuarioId, tabela: "pedidos_compra", registro: pedidoId, acao: "DEVOLVER_FORNECEDOR", dadosDepois: { itens, observacao }, tenant: ctx });
    return { message: "Devolução registrada e estoque estornado" };
  }

  async cancelar(ctx: TenantContext, id: string, usuarioId: string) {
    const atual = await this.buscarPorId(ctx, id);
    if (!atual) throw new Error("Pedido não encontrado");
    const pedido = await prisma.pedidoCompra.update({ where: { id }, data: { status: "CANCELADO" } });
    await registrarAuditoria({ usuarioId, tabela: "pedidos_compra", registro: id, acao: "CANCELAR", tenant: ctx });
    return pedido;
  }

  async historico(ctx: TenantContext, produtoId?: string, fornecedorId?: string) {
    return prisma.itemPedidoCompra.findMany({
      where: { ...(produtoId ? { produtoId } : {}), pedido: { ...tenantWhere(ctx), ...(fornecedorId ? { fornecedorId } : {}), status: { not: "CANCELADO" } } },
      include: { pedido: { include: { fornecedor: { select: { nome: true } } } }, produto: { select: { nome: true, codigoInterno: true } } },
      orderBy: { criadoEm: "desc" },
      take: 200,
    });
  }
}
