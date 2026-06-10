import { prisma } from "../../core/prisma/prisma.js";

export class NotificacoesService {
  async alertasEstoque() {
    const produtos = await prisma.produto.findMany({
      where: { ativo: true },
      select: {
        id: true, nome: true, codigoInterno: true,
        estoqueAtual: true, estoqueMinimo: true,
        categoria: { select: { nome: true } },
        fornecedor: { select: { nome: true } },
      },
    });

    const alertas = [];

    for (const p of produtos) {
      if (p.estoqueAtual === 0) {
        alertas.push({ tipo: "ZERADO", nivel: "CRITICO", produto: p,
          mensagem: `${p.nome} está com estoque zerado` });
      } else if (p.estoqueAtual <= p.estoqueMinimo) {
        alertas.push({ tipo: "BAIXO", nivel: "ALERTA", produto: p,
          mensagem: `${p.nome} está abaixo do estoque mínimo (${p.estoqueAtual}/${p.estoqueMinimo})` });
      }
    }

    return {
      total: alertas.length,
      criticos: alertas.filter(a => a.nivel === "CRITICO").length,
      alertas: alertas.filter(a => a.nivel === "ALERTA").length,
      itens: alertas,
    };
  }

  async resumoGeral() {
    const [pedidosAbertos, osAbertas, alertas] = await Promise.all([
      prisma.pedidoCompra.count({ where: { status: { in: ["RASCUNHO", "ENVIADO", "PARCIAL"] } } }),
      prisma.ordemServico.count({ where: { status: { in: ["ABERTA", "EM_ANDAMENTO", "AGUARDANDO_PECA"] } } }),
      this.alertasEstoque(),
    ]);

    return { pedidosAbertos, osAbertas, alertasEstoque: alertas.total, criticos: alertas.criticos };
  }
}
