import { prisma } from "../../core/prisma/prisma.js";
import { registrarAuditoria } from "../../core/auditoria.js";
import { TenantContext } from "../../core/tenant.js";

const tenantValues = (ctx: TenantContext) => ({ empresaId: ctx.empresaId ?? null, filialId: ctx.filialId ?? null });
const tenantSql = (ctx: TenantContext) => ({ empresaId: ctx.empresaId ?? null, filialId: ctx.filialId ?? null });

type CreatePayload = Record<string, unknown>;

export class EnterpriseService {
  private async insert(table: string, ctx: TenantContext, data: CreatePayload) {
    const payload: Record<string, unknown> = { ...tenantValues(ctx), ...data };
    const keys = Object.keys(payload).filter((k) => payload[k] !== undefined);
    const cols = keys.map((k) => `"${k}"`).join(", ");
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
    const values = keys.map((k) => payload[k]);
    const rows = await prisma.$queryRawUnsafe<any[]>(`INSERT INTO "${table}" (${cols}) VALUES (${placeholders}) RETURNING *`, ...values);
    await registrarAuditoria({ tenant: ctx, usuarioId: ctx.usuarioId, tabela: table, registro: rows[0]?.id ?? "", acao: "CRIAR", dadosDepois: rows[0] });
    return rows[0];
  }

  private list(table: string, ctx: TenantContext, limit = 100) {
    const t = tenantSql(ctx);
    return prisma.$queryRawUnsafe<any[]>(`SELECT * FROM "${table}" WHERE ("empresaId" = $1 OR ($1::text IS NULL AND "empresaId" IS NULL)) AND ("filialId" = $2 OR ($2::text IS NULL AND "filialId" IS NULL)) ORDER BY "criadoEm" DESC LIMIT $3`, t.empresaId, t.filialId, limit);
  }

  leads(ctx: TenantContext) { return this.list("leads_crm", ctx); }
  criarLead(ctx: TenantContext, data: CreatePayload) { return this.insert("leads_crm", ctx, data); }
  oportunidades(ctx: TenantContext) { return this.list("oportunidades_crm", ctx); }
  criarOportunidade(ctx: TenantContext, data: CreatePayload) { return this.insert("oportunidades_crm", ctx, data); }
  atividades(ctx: TenantContext) { return this.list("atividades_crm", ctx); }
  criarAtividade(ctx: TenantContext, data: CreatePayload) { return this.insert("atividades_crm", ctx, data); }

  solicitacoesCompra(ctx: TenantContext) { return this.list("solicitacoes_compra", ctx); }
  criarSolicitacaoCompra(ctx: TenantContext, data: CreatePayload) { return this.insert("solicitacoes_compra", ctx, { ...data, solicitanteId: ctx.usuarioId }); }
  cotacoesCompra(ctx: TenantContext) { return this.list("cotacoes_compra", ctx); }
  criarCotacaoCompra(ctx: TenantContext, data: CreatePayload) { return this.insert("cotacoes_compra", ctx, data); }
  async aprovarSolicitacao(ctx: TenantContext, id: string) {
    const rows = await prisma.$queryRawUnsafe<any[]>(`UPDATE "solicitacoes_compra" SET "status"='APROVADA', "aprovadorId"=$1, "aprovadoEm"=CURRENT_TIMESTAMP WHERE "id"=$2 RETURNING *`, ctx.usuarioId, id);
    await registrarAuditoria({ tenant: ctx, usuarioId: ctx.usuarioId, tabela: "solicitacoes_compra", registro: id, acao: "APROVAR", dadosDepois: rows[0] });
    return rows[0];
  }

  orcamentosVenda(ctx: TenantContext) { return this.list("orcamentos_venda", ctx); }
  criarOrcamentoVenda(ctx: TenantContext, data: CreatePayload) { return this.insert("orcamentos_venda", ctx, data); }
  pedidosVenda(ctx: TenantContext) { return this.list("pedidos_venda_corporativos", ctx); }
  criarPedidoVenda(ctx: TenantContext, data: CreatePayload) { return this.insert("pedidos_venda_corporativos", ctx, data); }
  tabelasPreco(ctx: TenantContext) { return this.list("tabelas_preco", ctx); }
  criarTabelaPreco(ctx: TenantContext, data: CreatePayload) { return this.insert("tabelas_preco", ctx, data); }

  configuracoesTributarias(ctx: TenantContext) { return this.list("configuracoes_tributarias", ctx); }
  criarConfiguracaoTributaria(ctx: TenantContext, data: CreatePayload) { return this.insert("configuracoes_tributarias", ctx, data); }
  entradasFiscais(ctx: TenantContext) { return this.list("entradas_fiscais_compra", ctx); }
  criarEntradaFiscal(ctx: TenantContext, data: CreatePayload) { return this.insert("entradas_fiscais_compra", ctx, data); }


  async escolherCotacaoVencedora(ctx: TenantContext, id: string) {
    const t = tenantSql(ctx);
    return prisma.$transaction(async (tx) => {
      const rows = await tx.$queryRawUnsafe<any[]>(`UPDATE "cotacoes_compra" SET "vencedora"=true, "status"='VENCEDORA' WHERE "id"=$1 AND ("empresaId"=$2 OR ($2::text IS NULL AND "empresaId" IS NULL)) AND ("filialId"=$3 OR ($3::text IS NULL AND "filialId" IS NULL)) RETURNING *`, id, t.empresaId, t.filialId);
      await registrarAuditoria({ tenant: ctx, usuarioId: ctx.usuarioId, tabela: "cotacoes_compra", registro: id, acao: "COTACAO_VENCEDORA", dadosDepois: rows[0] });
      return rows[0];
    });
  }

  async aprovarOrcamento(ctx: TenantContext, id: string) {
    const t = tenantSql(ctx);
    const rows = await prisma.$queryRawUnsafe<any[]>(`UPDATE "orcamentos_venda" SET "status"='APROVADO' WHERE "id"=$1 AND ("empresaId"=$2 OR ($2::text IS NULL AND "empresaId" IS NULL)) AND ("filialId"=$3 OR ($3::text IS NULL AND "filialId" IS NULL)) RETURNING *`, id, t.empresaId, t.filialId);
    await registrarAuditoria({ tenant: ctx, usuarioId: ctx.usuarioId, tabela: "orcamentos_venda", registro: id, acao: "APROVAR_ORCAMENTO", dadosDepois: rows[0] });
    return rows[0];
  }

  async converterOportunidadeEmOrcamento(ctx: TenantContext, id: string) {
    const t = tenantSql(ctx);
    const oportunidades = await prisma.$queryRawUnsafe<any[]>(`SELECT * FROM "oportunidades_crm" WHERE "id"=$1 AND ("empresaId"=$2 OR ($2::text IS NULL AND "empresaId" IS NULL)) AND ("filialId"=$3 OR ($3::text IS NULL AND "filialId" IS NULL))`, id, t.empresaId, t.filialId);
    const oportunidade = oportunidades[0];
    if (!oportunidade) throw new Error("Oportunidade não encontrada");
    const orcamento = await this.insert("orcamentos_venda", ctx, { oportunidadeId: id, clienteId: oportunidade.clienteId, vendedorId: oportunidade.responsavelId, valorTotal: oportunidade.valorEstimado, status: "RASCUNHO" });
    await prisma.$queryRawUnsafe(`UPDATE "oportunidades_crm" SET "status"='CONVERTIDA' WHERE "id"=$1`, id);
    return orcamento;
  }

  async faturarPedidoVenda(ctx: TenantContext, id: string) {
    const t = tenantSql(ctx);
    const rows = await prisma.$queryRawUnsafe<any[]>(`UPDATE "pedidos_venda_corporativos" SET "status"='FATURADO', "faturadoParcial"=false WHERE "id"=$1 AND ("empresaId"=$2 OR ($2::text IS NULL AND "empresaId" IS NULL)) AND ("filialId"=$3 OR ($3::text IS NULL AND "filialId" IS NULL)) RETURNING *`, id, t.empresaId, t.filialId);
    await registrarAuditoria({ tenant: ctx, usuarioId: ctx.usuarioId, tabela: "pedidos_venda_corporativos", registro: id, acao: "FATURAMENTO", dadosDepois: rows[0] });
    return rows[0];
  }

  async pipeline(ctx: TenantContext) {
    const t = tenantSql(ctx);
    const rows = await prisma.$queryRawUnsafe<any[]>(`SELECT "etapa", COUNT(*)::int AS quantidade, COALESCE(SUM("valorEstimado"),0)::numeric AS valor FROM "oportunidades_crm" WHERE ("empresaId"=$1 OR ($1::text IS NULL AND "empresaId" IS NULL)) AND ("filialId"=$2 OR ($2::text IS NULL AND "filialId" IS NULL)) AND "status"='ABERTA' GROUP BY "etapa" ORDER BY valor DESC`, t.empresaId, t.filialId);
    return rows;
  }
}
