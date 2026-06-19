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


export type RegimeDre = "CAIXA" | "COMPETENCIA";

export interface LancamentoDreResumo {
  tipo: "RECEITA" | "DESPESA";
  categoria?: string | null;
  valor: number;
}

export function consolidarDreGerencial(lancamentos: LancamentoDreResumo[]) {
  const linhas = new Map<string, { categoria: string; receitas: number; despesas: number; resultado: number }>();
  for (const lancamento of lancamentos) {
    const categoria = lancamento.categoria || "Sem categoria";
    const linha = linhas.get(categoria) ?? { categoria, receitas: 0, despesas: 0, resultado: 0 };
    if (lancamento.tipo === "RECEITA") linha.receitas += lancamento.valor;
    else linha.despesas += lancamento.valor;
    linha.resultado = linha.receitas - linha.despesas;
    linhas.set(categoria, linha);
  }
  const detalhes = [...linhas.values()].sort((a, b) => a.categoria.localeCompare(b.categoria));
  const receitas = detalhes.reduce((s, l) => s + l.receitas, 0);
  const despesas = detalhes.reduce((s, l) => s + l.despesas, 0);
  return { receitas, despesas, resultado: receitas - despesas, detalhes };
}

export function calcularSaldoDisponivel(estoqueFisico: number, reservado: number, bloqueado = 0) {
  return {
    estoqueFisico,
    reservado,
    bloqueado,
    disponivel: Math.max(0, estoqueFisico - reservado - bloqueado),
  };
}

export function assertPeriodoFinanceiroAberto(status?: string | null): void {
  if (status === "FECHADO") throw new Error("Período financeiro fechado");
}

export function calcularAgingContas<T extends { vencimento: Date; valor: number; valorBaixado?: number }>(contas: T[], referencia = new Date()) {
  const ref = new Date(referencia); ref.setHours(0, 0, 0, 0);
  const buckets = { aVencer: 0, vencido1a30: 0, vencido31a60: 0, vencido61a90: 0, vencidoMais90: 0 };
  for (const conta of contas) {
    const saldo = conta.valor - (conta.valorBaixado ?? 0);
    const dias = Math.floor((ref.getTime() - new Date(conta.vencimento).getTime()) / 86400000);
    if (dias <= 0) buckets.aVencer += saldo;
    else if (dias <= 30) buckets.vencido1a30 += saldo;
    else if (dias <= 60) buckets.vencido31a60 += saldo;
    else if (dias <= 90) buckets.vencido61a90 += saldo;
    else buckets.vencidoMais90 += saldo;
  }
  return buckets;
}
