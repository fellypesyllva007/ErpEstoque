export type TipoMovimentacaoEstoque = "ENTRADA" | "SAIDA";

export interface ItemVendaCalculo {
  quantidade: number;
  precoUnitario: number;
  desconto?: number | null;
}

export interface ProdutoEstoqueResumo {
  nome: string;
  estoqueAtual: number;
}

export interface ItemPedidoCompraResumo {
  quantidade: number;
  qtdRecebida: number;
}

export interface ProdutoReposicaoResumo {
  id: string;
  nome: string;
  codigoInterno: string;
  estoqueAtual: number;
  estoqueMinimo: number;
  fornecedor?: { nome: string } | null;
}

export interface SugestaoReposicao {
  id: string;
  nome: string;
  codigoInterno: string;
  fornecedor?: string;
  estoqueAtual: number;
  estoqueMinimo: number;
  saidaMes: number;
  consumoDiario: number;
  coberturaDias: number;
  sugestaoCompra: number;
  criticidade: "CRITICO" | "ALERTA" | "OK";
}

export function assertEstoqueDisponivel(
  produto: ProdutoEstoqueResumo,
  quantidade: number
): void {
  if (produto.estoqueAtual < quantidade) {
    throw new Error(
      `Estoque insuficiente para "${produto.nome}". Disponível: ${produto.estoqueAtual}`
    );
  }
}

export function calcularEstoquePosterior(
  estoqueAtual: number,
  quantidade: number,
  tipo: TipoMovimentacaoEstoque
): number {
  return tipo === "ENTRADA"
    ? estoqueAtual + quantidade
    : estoqueAtual - quantidade;
}

export function calcularTotalVenda(
  itens: ItemVendaCalculo[],
  descontoGlobal = 0
): number {
  return itens.reduce((total, item) => {
    const subtotal = item.quantidade * item.precoUnitario - (item.desconto ?? 0);
    return total + subtotal;
  }, 0) - descontoGlobal;
}

export function calcularStatusPedidoCompra(
  itens: ItemPedidoCompraResumo[]
): "RECEBIDO" | "PARCIAL" | "ENVIADO" {
  const todosConcluidos = itens.every(
    (item) => item.qtdRecebida >= item.quantidade
  );
  const algumRecebido = itens.some(
    (item) => item.qtdRecebida > 0
  );

  return todosConcluidos
    ? "RECEBIDO"
    : algumRecebido
      ? "PARCIAL"
      : "ENVIADO";
}

export function calcularSugestaoReposicaoProduto(
  produto: ProdutoReposicaoResumo,
  saidaMes: number
): SugestaoReposicao {
  const consumoDiario = saidaMes / 30;
  const coberturaDias = consumoDiario > 0
    ? Math.floor(produto.estoqueAtual / consumoDiario)
    : 999;
  const sugestaoCompra = Math.max(
    0,
    Math.ceil(produto.estoqueMinimo * 2 - produto.estoqueAtual)
  );

  return {
    id: produto.id,
    nome: produto.nome,
    codigoInterno: produto.codigoInterno,
    fornecedor: produto.fornecedor?.nome,
    estoqueAtual: produto.estoqueAtual,
    estoqueMinimo: produto.estoqueMinimo,
    saidaMes,
    consumoDiario: Number(consumoDiario.toFixed(2)),
    coberturaDias,
    sugestaoCompra,
    criticidade: coberturaDias <= 7
      ? "CRITICO"
      : coberturaDias <= 15
        ? "ALERTA"
        : "OK",
  };
}

export function deveExibirSugestaoReposicao(
  sugestao: SugestaoReposicao
): boolean {
  return sugestao.sugestaoCompra > 0 || sugestao.criticidade !== "OK";
}

export function montarCodigoPermissao(
  moduloCodigo: string,
  telaCodigo: string,
  permissaoCodigo: string
): string {
  return `${moduloCodigo}.${telaCodigo}.${permissaoCodigo}`;
}
