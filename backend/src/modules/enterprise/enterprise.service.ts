import { prisma } from "../../core/prisma/prisma.js";
import { registrarAuditoria } from "../../core/auditoria.js";
import { TenantContext, tenantCreate, tenantWhere } from "../../core/tenant.js";

type CreatePayload = Record<string, any>;
type DelegateName =
  | "leadCrm" | "oportunidadeCrm" | "atividadeCrm" | "solicitacaoCompra" | "cotacaoCompra"
  | "orcamentoVenda" | "pedidoVendaCorporativo" | "tabelaPreco" | "configuracaoTributaria" | "entradaFiscalCompra"
  | "eventoIntegracaoErp" | "regraWorkflow" | "instanciaWorkflow" | "listaTecnicaProduto" | "ordemProducao"
  | "rodadaMrp" | "enderecoEstoque" | "tarefaWms" | "visaoAnalitica";

const modelTable: Record<DelegateName, string> = {
  leadCrm: "leads_crm",
  oportunidadeCrm: "oportunidades_crm",
  atividadeCrm: "atividades_crm",
  solicitacaoCompra: "solicitacoes_compra",
  cotacaoCompra: "cotacoes_compra",
  orcamentoVenda: "orcamentos_venda",
  pedidoVendaCorporativo: "pedidos_venda_corporativos",
  tabelaPreco: "tabelas_preco",
  configuracaoTributaria: "configuracoes_tributarias",
  entradaFiscalCompra: "entradas_fiscais_compra",
  eventoIntegracaoErp: "eventos_integracao_erp",
  regraWorkflow: "regras_workflow",
  instanciaWorkflow: "instancias_workflow",
  listaTecnicaProduto: "listas_tecnicas_produto",
  ordemProducao: "ordens_producao",
  rodadaMrp: "rodadas_mrp",
  enderecoEstoque: "enderecos_estoque",
  tarefaWms: "tarefas_wms",
  visaoAnalitica: "visoes_analiticas",
};

export class EnterpriseService {
  private delegate(tx: any, model: DelegateName) { return tx[model]; }

  private async create(model: DelegateName, ctx: TenantContext, data: CreatePayload) {
    const registro = await this.delegate(prisma, model).create({ data: { ...data, ...tenantCreate(ctx) } });
    await registrarAuditoria({ tenant: ctx, usuarioId: ctx.usuarioId, tabela: modelTable[model], registro: registro.id, acao: "CRIAR", dadosDepois: registro });
    return registro;
  }

  private list(model: DelegateName, ctx: TenantContext, limit = 100) {
    return this.delegate(prisma, model).findMany({ where: tenantWhere(ctx), orderBy: { criadoEm: "desc" }, take: limit });
  }

  private async registrarEvento(tx: any, ctx: TenantContext, modulo: string, tipo: string, referenciaId: string, payload?: unknown) {
    return tx.eventoIntegracaoErp.create({ data: { ...tenantCreate(ctx), modulo, tipo, referenciaId, payload: payload as any, status: "PROCESSADO" } });
  }

  leads(ctx: TenantContext) { return this.list("leadCrm", ctx); }
  criarLead(ctx: TenantContext, data: CreatePayload) { return this.create("leadCrm", ctx, data); }
  oportunidades(ctx: TenantContext) { return this.list("oportunidadeCrm", ctx); }
  criarOportunidade(ctx: TenantContext, data: CreatePayload) { return this.create("oportunidadeCrm", ctx, data); }
  atividades(ctx: TenantContext) { return this.list("atividadeCrm", ctx); }
  criarAtividade(ctx: TenantContext, data: CreatePayload) { return this.create("atividadeCrm", ctx, data); }

  solicitacoesCompra(ctx: TenantContext) { return this.list("solicitacaoCompra", ctx); }
  criarSolicitacaoCompra(ctx: TenantContext, data: CreatePayload) { return this.create("solicitacaoCompra", ctx, { ...data, solicitanteId: ctx.usuarioId }); }
  cotacoesCompra(ctx: TenantContext) { return this.list("cotacaoCompra", ctx); }
  criarCotacaoCompra(ctx: TenantContext, data: CreatePayload) { return this.create("cotacaoCompra", ctx, data); }

  async aprovarSolicitacao(ctx: TenantContext, id: string) {
    return prisma.$transaction(async (tx) => {
      const registro = await tx.solicitacaoCompra.update({ where: { id }, data: { status: "APROVADA", aprovadorId: ctx.usuarioId, aprovadoEm: new Date() } });
      await this.registrarEvento(tx, ctx, "MM", "SOLICITACAO_COMPRA_APROVADA", id, registro);
      await registrarAuditoria({ tenant: ctx, usuarioId: ctx.usuarioId, tabela: "solicitacoes_compra", registro: id, acao: "APROVAR", dadosDepois: registro });
      return registro;
    });
  }

  orcamentosVenda(ctx: TenantContext) { return this.list("orcamentoVenda", ctx); }
  criarOrcamentoVenda(ctx: TenantContext, data: CreatePayload) { return this.create("orcamentoVenda", ctx, data); }
  pedidosVenda(ctx: TenantContext) { return this.list("pedidoVendaCorporativo", ctx); }
  criarPedidoVenda(ctx: TenantContext, data: CreatePayload) { return this.create("pedidoVendaCorporativo", ctx, data); }
  tabelasPreco(ctx: TenantContext) { return this.list("tabelaPreco", ctx); }
  criarTabelaPreco(ctx: TenantContext, data: CreatePayload) { return this.create("tabelaPreco", ctx, data); }

  configuracoesTributarias(ctx: TenantContext) { return this.list("configuracaoTributaria", ctx); }
  criarConfiguracaoTributaria(ctx: TenantContext, data: CreatePayload) { return this.create("configuracaoTributaria", ctx, data); }
  entradasFiscais(ctx: TenantContext) { return this.list("entradaFiscalCompra", ctx); }
  criarEntradaFiscal(ctx: TenantContext, data: CreatePayload) { return this.create("entradaFiscalCompra", ctx, data); }

  workflows(ctx: TenantContext) { return this.list("regraWorkflow", ctx); }
  criarWorkflow(ctx: TenantContext, data: CreatePayload) { return this.create("regraWorkflow", ctx, data); }
  listasTecnicas(ctx: TenantContext) { return this.list("listaTecnicaProduto", ctx); }
  criarListaTecnica(ctx: TenantContext, data: CreatePayload) { return this.create("listaTecnicaProduto", ctx, data); }
  ordensProducao(ctx: TenantContext) { return this.list("ordemProducao", ctx); }
  criarOrdemProducao(ctx: TenantContext, data: CreatePayload) { return this.create("ordemProducao", ctx, data); }
  rodadasMrp(ctx: TenantContext) { return this.list("rodadaMrp", ctx); }
  criarRodadaMrp(ctx: TenantContext, data: CreatePayload) { return this.create("rodadaMrp", ctx, data); }
  enderecosEstoque(ctx: TenantContext) { return this.list("enderecoEstoque", ctx); }
  criarEnderecoEstoque(ctx: TenantContext, data: CreatePayload) { return this.create("enderecoEstoque", ctx, data); }
  tarefasWms(ctx: TenantContext) { return this.list("tarefaWms", ctx); }
  criarTarefaWms(ctx: TenantContext, data: CreatePayload) { return this.create("tarefaWms", ctx, data); }
  visoesAnaliticas(ctx: TenantContext) { return this.list("visaoAnalitica", ctx); }
  criarVisaoAnalitica(ctx: TenantContext, data: CreatePayload) { return this.create("visaoAnalitica", ctx, data); }

  async escolherCotacaoVencedora(ctx: TenantContext, id: string) {
    return prisma.$transaction(async (tx) => {
      const cotacao = await tx.cotacaoCompra.update({ where: { id }, data: { vencedora: true, status: "VENCEDORA" } });
      await this.registrarEvento(tx, ctx, "MM", "COTACAO_VENCEDORA", id, cotacao);
      await registrarAuditoria({ tenant: ctx, usuarioId: ctx.usuarioId, tabela: "cotacoes_compra", registro: id, acao: "COTACAO_VENCEDORA", dadosDepois: cotacao });
      return cotacao;
    });
  }

  async aprovarOrcamento(ctx: TenantContext, id: string) {
    const registro = await prisma.orcamentoVenda.update({ where: { id }, data: { status: "APROVADO", aprovadoEm: new Date() } });
    await registrarAuditoria({ tenant: ctx, usuarioId: ctx.usuarioId, tabela: "orcamentos_venda", registro: id, acao: "APROVAR_ORCAMENTO", dadosDepois: registro });
    return registro;
  }

  async converterOportunidadeEmOrcamento(ctx: TenantContext, id: string) {
    return prisma.$transaction(async (tx) => {
      const oportunidade = await tx.oportunidadeCrm.findFirstOrThrow({ where: { id, ...tenantWhere(ctx) } });
      const orcamento = await tx.orcamentoVenda.create({ data: { ...tenantCreate(ctx), oportunidadeId: id, clienteId: oportunidade.clienteId, vendedorId: oportunidade.responsavelId, valorTotal: oportunidade.valorEstimado, status: "RASCUNHO" } });
      await tx.oportunidadeCrm.update({ where: { id }, data: { status: "CONVERTIDA" } });
      await this.registrarEvento(tx, ctx, "SD", "OPORTUNIDADE_CONVERTIDA", id, { oportunidade, orcamento });
      return orcamento;
    });
  }

  async faturarPedidoVenda(ctx: TenantContext, id: string) {
    return prisma.$transaction(async (tx) => {
      const pedido = await tx.pedidoVendaCorporativo.update({ where: { id }, data: { status: "FATURADO", faturadoParcial: false } });
      await this.registrarEvento(tx, ctx, "SD/FI/FISCAL", "PEDIDO_FATURADO", id, pedido);
      await registrarAuditoria({ tenant: ctx, usuarioId: ctx.usuarioId, tabela: "pedidos_venda_corporativos", registro: id, acao: "FATURAMENTO", dadosDepois: pedido });
      return pedido;
    });
  }

  async pipeline(ctx: TenantContext) {
    const oportunidades = await prisma.oportunidadeCrm.findMany({ where: { ...tenantWhere(ctx), status: "ABERTA" } });
    const porEtapa = new Map<string, { etapa: string; quantidade: number; valor: number }>();
    oportunidades.forEach((o) => {
      const atual = porEtapa.get(o.etapa) ?? { etapa: o.etapa, quantidade: 0, valor: 0 };
      atual.quantidade += 1;
      atual.valor += Number(o.valorEstimado);
      porEtapa.set(o.etapa, atual);
    });
    return [...porEtapa.values()].sort((a, b) => b.valor - a.valor);
  }
}
