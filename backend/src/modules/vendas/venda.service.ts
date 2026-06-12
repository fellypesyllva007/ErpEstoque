import { prisma } from "../../core/prisma/prisma.js";
import { registrarAuditoria } from "../../core/auditoria.js";
import { CreateVendaDto } from "./venda.types.js";
import {
  assertEstoqueDisponivel,
  calcularEstoquePosterior,
  calcularTotalVenda,
} from "../../core/business-rules.js";

function gerarNumeroVenda() {
  const d = new Date();
  return `VD-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}-${Math.floor(Math.random()*99999).toString().padStart(5,'0')}`;
}

export class VendaService {
  async listar(status?: string, dataInicio?: string, dataFim?: string) {
    return prisma.venda.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(dataInicio || dataFim ? {
          criadoEm: {
            ...(dataInicio ? { gte: new Date(dataInicio) } : {}),
            ...(dataFim ? { lte: new Date(dataFim + "T23:59:59") } : {}),
          },
        } : {}),
      },
      include: {
        cliente: { select: { nome: true } },
        itens: { include: { produto: { select: { nome: true, codigoInterno: true } } } },
      },
      orderBy: { criadoEm: "desc" },
    });
  }

  async buscarPorId(id: string) {
    return prisma.venda.findUnique({
      where: { id },
      include: {
        cliente: true,
        itens: { include: { produto: { select: { nome: true, codigoInterno: true } } } },
      },
    });
  }

  async criar(data: CreateVendaDto, usuarioId: string) {
    // Verificar estoque antes de tudo
    for (const item of data.itens) {
      const prod = await prisma.produto.findUniqueOrThrow({ where: { id: item.produtoId } });
      assertEstoqueDisponivel(prod, item.quantidade);
    }

    const descontoGlobal = data.desconto ?? 0;
    const valorTotal = calcularTotalVenda(data.itens, descontoGlobal);

    const venda = await prisma.$transaction(async (tx) => {
      const v = await tx.venda.create({
        data: {
          numero: gerarNumeroVenda(),
          clienteId: data.clienteId,
          formaPagamento: data.formaPagamento,
          desconto: descontoGlobal,
          observacoes: data.observacoes,
          valorTotal,
          status: "CONCLUIDA",
          itens: {
            create: data.itens.map(i => ({
              produtoId: i.produtoId,
              quantidade: i.quantidade,
              precoUnitario: i.precoUnitario,
              desconto: i.desconto ?? 0,
            })),
          },
        },
        include: { itens: true, cliente: { select: { nome: true } } },
      });

      // Baixa automática de estoque
      for (const item of data.itens) {
        const prod = await tx.produto.findUniqueOrThrow({ where: { id: item.produtoId } });
        const anterior = prod.estoqueAtual;
        const posterior = calcularEstoquePosterior(anterior, item.quantidade, "SAIDA");

        await tx.produto.update({ where: { id: item.produtoId }, data: { estoqueAtual: posterior } });
        await tx.movimentacaoEstoque.create({
          data: {
            produtoId: item.produtoId, tipo: "SAIDA",
            quantidade: item.quantidade, estoqueAnterior: anterior,
            estoquePosterior: posterior, observacao: `Venda ${v.numero}`,
          },
        });
      }

      return v;
    });

    await registrarAuditoria({ usuarioId, tabela: "vendas", registro: venda.id, acao: "CRIAR", dadosDepois: venda });
    return venda;
  }

  async cancelar(id: string, usuarioId: string) {
    const venda = await prisma.venda.findUniqueOrThrow({
      where: { id }, include: { itens: true },
    });

    if (venda.status === "CANCELADA") throw new Error("Venda já cancelada");

    await prisma.$transaction(async (tx) => {
      await tx.venda.update({ where: { id }, data: { status: "CANCELADA" } });

      // Estorno de estoque
      for (const item of venda.itens) {
        const prod = await tx.produto.findUniqueOrThrow({ where: { id: item.produtoId } });
        const anterior = prod.estoqueAtual;
        const posterior = calcularEstoquePosterior(anterior, item.quantidade, "ENTRADA");
        await tx.produto.update({ where: { id: item.produtoId }, data: { estoqueAtual: posterior } });
        await tx.movimentacaoEstoque.create({
          data: {
            produtoId: item.produtoId, tipo: "ENTRADA",
            quantidade: item.quantidade, estoqueAnterior: anterior,
            estoquePosterior: posterior, observacao: `Cancelamento Venda ${venda.numero}`,
          },
        });
      }
    });

    await registrarAuditoria({ usuarioId, tabela: "vendas", registro: id, acao: "CANCELAR" });
    return { message: "Venda cancelada e estoque estornado" };
  }

  async rankingMaisVendidos(periodo: "mes" | "ano" | "30dias") {
    const agora = new Date();
    let inicio: Date;
    if (periodo === "mes") { inicio = new Date(agora.getFullYear(), agora.getMonth(), 1); }
    else if (periodo === "ano") { inicio = new Date(agora.getFullYear(), 0, 1); }
    else { inicio = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000); }

    const itens = await prisma.itemVenda.findMany({
      where: { venda: { status: "CONCLUIDA", criadoEm: { gte: inicio } } },
      include: { produto: { select: { nome: true, codigoInterno: true, categoria: { select: { nome: true } } } } },
    });

    const mapa: Record<string, {
      produto: { nome: string; codigoInterno: string; categoria: { nome: string } | null };
      qtd: number;
      faturamento: number;
    }> = {};
    for (const i of itens) {
      if (!mapa[i.produtoId]) mapa[i.produtoId] = { produto: i.produto, qtd: 0, faturamento: 0 };
      mapa[i.produtoId].qtd += i.quantidade;
      mapa[i.produtoId].faturamento += i.quantidade * Number(i.precoUnitario) - Number(i.desconto);
    }

    return Object.values(mapa)
      .sort((a, b) => b.qtd - a.qtd)
      .slice(0, 10);
  }

  async indicadoresHoje() {
    const hoje = new Date(); hoje.setHours(0,0,0,0);
    const [qtd, soma] = await Promise.all([
      prisma.venda.count({ where: { status: "CONCLUIDA", criadoEm: { gte: hoje } } }),
      prisma.venda.aggregate({ where: { status: "CONCLUIDA", criadoEm: { gte: hoje } }, _sum: { valorTotal: true } }),
    ]);
    return { vendasHoje: qtd, faturamentoHoje: Number(soma._sum.valorTotal ?? 0) };
  }
}
