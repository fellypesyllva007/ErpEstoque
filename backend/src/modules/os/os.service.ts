import { prisma } from "../../core/prisma/prisma.js";
import { registrarAuditoria } from "../../core/auditoria.js";
import { CreateOSDto, UpdateOSDto, AdicionarPecaDto } from "./os.types.js";
import {
  assertEstoqueDisponivel,
  calcularEstoquePosterior,
} from "../../core/business-rules.js";

function gerarNumeroOS(): string {
  const d = new Date();
  return `OS-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}-${Math.floor(Math.random()*99999).toString().padStart(5,'0')}`;
}

export class OSService {
  async listar(status?: string) {
    return prisma.ordemServico.findMany({
      where: status ? { status } : undefined,
      include: {
        cliente: { select: { nome: true, telefone: true } },
        tecnico: { select: { nome: true } },
        itens: { include: { produto: { select: { nome: true } } } },
      },
      orderBy: { criadoEm: "desc" },
    });
  }

  async buscarPorId(id: string) {
    return prisma.ordemServico.findUnique({
      where: { id },
      include: {
        cliente: true,
        tecnico: { select: { nome: true } },
        itens: { include: { produto: { select: { nome: true, codigoInterno: true } } } },
      },
    });
  }

  async criar(data: CreateOSDto, usuarioId: string) {
    const os = await prisma.ordemServico.create({
      data: { ...data, numero: gerarNumeroOS(), status: "ABERTA" },
      include: { cliente: { select: { nome: true } } },
    });
    await registrarAuditoria({ usuarioId, tabela: "ordens_servico", registro: os.id, acao: "CRIAR", dadosDepois: os });
    return os;
  }

  async atualizar(id: string, data: UpdateOSDto, usuarioId: string) {
    const antes = await prisma.ordemServico.findUnique({ where: { id } });
    const os = await prisma.ordemServico.update({
      where: { id },
      data: {
        ...data,
        dataPrevisao: data.dataPrevisao ? new Date(data.dataPrevisao) : undefined,
        dataConclusao: data.status === "CONCLUIDA" ? new Date() : undefined,
      },
    });
    await registrarAuditoria({ usuarioId, tabela: "ordens_servico", registro: id, acao: "ATUALIZAR", dadosAntes: antes ?? undefined, dadosDepois: os });
    return os;
  }

  async adicionarPeca(ordemId: string, data: AdicionarPecaDto, usuarioId: string) {
    // Verificar estoque
    const produto = await prisma.produto.findUniqueOrThrow({ where: { id: data.produtoId } });
    assertEstoqueDisponivel(produto, data.quantidade);

    const item = await prisma.$transaction(async (tx) => {
      const it = await tx.itemOS.create({
        data: { ordemId, produtoId: data.produtoId, quantidade: data.quantidade, precoUnitario: data.precoUnitario },
      });
      // Baixa de estoque
      const ant = produto.estoqueAtual;
      const pos = calcularEstoquePosterior(ant, data.quantidade, "SAIDA");
      await tx.produto.update({ where: { id: data.produtoId }, data: { estoqueAtual: pos } });
      await tx.movimentacaoEstoque.create({
        data: { produtoId: data.produtoId, tipo: "SAIDA", quantidade: data.quantidade, estoqueAnterior: ant, estoquePosterior: pos, observacao: `Peça utilizada em OS ${ordemId}` },
      });
      return it;
    });

    await registrarAuditoria({ usuarioId, tabela: "itens_os", registro: item.id, acao: "ADICIONAR_PECA" });
    return item;
  }

  async removerPeca(itemId: string, usuarioId: string) {
    const item = await prisma.itemOS.findUniqueOrThrow({ where: { id: itemId } });
    await prisma.$transaction(async (tx) => {
      await tx.itemOS.delete({ where: { id: itemId } });
      // Estorno
      const prod = await tx.produto.findUniqueOrThrow({ where: { id: item.produtoId } });
      const pos = calcularEstoquePosterior(prod.estoqueAtual, item.quantidade, "ENTRADA");
      await tx.produto.update({ where: { id: item.produtoId }, data: { estoqueAtual: pos } });
      await tx.movimentacaoEstoque.create({
        data: { produtoId: item.produtoId, tipo: "ENTRADA", quantidade: item.quantidade, estoqueAnterior: prod.estoqueAtual, estoquePosterior: pos, observacao: `Estorno peça removida OS ${item.ordemId}` },
      });
    });
    await registrarAuditoria({ usuarioId, tabela: "itens_os", registro: itemId, acao: "REMOVER_PECA" });
    return { message: "Peça removida e estoque estornado" };
  }

  async contarPorStatus() {
    return prisma.ordemServico.groupBy({
      by: ["status"],
      _count: { id: true },
    });
  }
}
