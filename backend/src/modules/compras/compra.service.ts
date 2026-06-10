import { prisma } from "../../core/prisma/prisma.js";
import { registrarAuditoria } from "../../core/auditoria.js";
import { CreatePedidoDto, RecebimentoDto } from "./compra.types.js";

function gerarNumeroPedido() {
  const d = new Date();
  return `PC-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}-${Math.floor(Math.random()*99999).toString().padStart(5,'0')}`;
}

export class CompraService {
  async listar(status?: string) {
    return prisma.pedidoCompra.findMany({
      where: status ? { status } : undefined,
      include: {
        fornecedor: { select: { nome: true } },
        itens: { include: { produto: { select: { nome: true, codigoInterno: true } } } },
      },
      orderBy: { criadoEm: "desc" },
    });
  }

  async buscarPorId(id: string) {
    return prisma.pedidoCompra.findUnique({
      where: { id },
      include: {
        fornecedor: true,
        itens: { include: { produto: { select: { nome: true, codigoInterno: true, custo: true } } } },
        recebimentos: {
          include: { itens: { include: { produto: { select: { nome: true } } } } },
          orderBy: { criadoEm: "desc" },
        },
      },
    });
  }

  async criar(data: CreatePedidoDto, usuarioId: string) {
    const valorTotal = data.itens.reduce((s, i) => s + i.quantidade * i.custoUnitario, 0);

    const pedido = await prisma.pedidoCompra.create({
      data: {
        numero: gerarNumeroPedido(),
        fornecedorId: data.fornecedorId,
        observacoes: data.observacoes,
        valorTotal,
        itens: { create: data.itens.map(i => ({ produtoId: i.produtoId, quantidade: i.quantidade, custoUnitario: i.custoUnitario })) },
      },
      include: { fornecedor: { select: { nome: true } }, itens: true },
    });

    await registrarAuditoria({ usuarioId, tabela: "pedidos_compra", registro: pedido.id, acao: "CRIAR", dadosDepois: pedido });
    return pedido;
  }

  async registrarRecebimento(data: RecebimentoDto, usuarioId: string) {
    const pedido = await prisma.pedidoCompra.findUniqueOrThrow({
      where: { id: data.pedidoId },
      include: { itens: true },
    });

    if (["RECEBIDO", "CANCELADO"].includes(pedido.status)) {
      throw new Error("Pedido não pode receber mais itens");
    }

    // Registrar recebimento e dar entrada no estoque em transação
    const recebimento = await prisma.$transaction(async (tx) => {
      const rec = await tx.recebimentoCompra.create({
        data: {
          pedidoId: data.pedidoId,
          observacoes: data.observacoes,
          itens: { create: data.itens.map(i => ({ produtoId: i.produtoId, quantidade: i.quantidade })) },
        },
        include: { itens: true },
      });

      for (const item of data.itens) {
        const prod = await tx.produto.findUniqueOrThrow({ where: { id: item.produtoId } });
        const anterior = prod.estoqueAtual;
        const posterior = anterior + item.quantidade;

        await tx.produto.update({ where: { id: item.produtoId }, data: { estoqueAtual: posterior } });
        await tx.movimentacaoEstoque.create({
          data: {
            produtoId: item.produtoId, tipo: "ENTRADA",
            quantidade: item.quantidade, estoqueAnterior: anterior,
            estoquePosterior: posterior, observacao: `Recebimento ${rec.id} - Pedido ${pedido.numero}`,
          },
        });

        // Atualizar qtdRecebida no item do pedido
        const itemPedido = pedido.itens.find(i => i.produtoId === item.produtoId);
        if (itemPedido) {
          await tx.itemPedidoCompra.update({
            where: { id: itemPedido.id },
            data: { qtdRecebida: { increment: item.quantidade } },
          });
        }
      }

      // Determinar novo status do pedido
      const itensAtualizados = await tx.itemPedidoCompra.findMany({ where: { pedidoId: data.pedidoId } });
      const todosConcluidos = itensAtualizados.every(i => i.qtdRecebida >= i.quantidade);
      const algumRecebido = itensAtualizados.some(i => i.qtdRecebida > 0);

      await tx.pedidoCompra.update({
        where: { id: data.pedidoId },
        data: { status: todosConcluidos ? "RECEBIDO" : algumRecebido ? "PARCIAL" : "ENVIADO" },
      });

      return rec;
    });

    await registrarAuditoria({ usuarioId, tabela: "recebimentos_compra", registro: recebimento.id, acao: "RECEBER" });
    return recebimento;
  }

  async cancelar(id: string, usuarioId: string) {
    const pedido = await prisma.pedidoCompra.update({ where: { id }, data: { status: "CANCELADO" } });
    await registrarAuditoria({ usuarioId, tabela: "pedidos_compra", registro: id, acao: "CANCELAR" });
    return pedido;
  }

  async historico(produtoId?: string, fornecedorId?: string) {
    return prisma.itemPedidoCompra.findMany({
      where: {
        ...(produtoId ? { produtoId } : {}),
        ...(fornecedorId ? { pedido: { fornecedorId } } : {}),
        pedido: { status: { not: "CANCELADO" } },
      },
      include: {
        pedido: { include: { fornecedor: { select: { nome: true } } } },
        produto: { select: { nome: true, codigoInterno: true } },
      },
      orderBy: { criadoEm: "desc" },
      take: 200,
    });
  }
}
