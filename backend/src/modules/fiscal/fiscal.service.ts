import { prisma } from "../../core/prisma/prisma.js";
import { registrarAuditoria } from "../../core/auditoria.js";
import { TenantContext, tenantCreate, tenantWhere } from "../../core/tenant.js";
import { CriarDocumentoFiscalDto, AtualizarStatusFiscalDto } from "./fiscal.types.js";
import { NfeWebClient } from "./nfeweb/nfeweb.client.js";

function numeroFiscalTemporario() {
  return Math.floor(Date.now() / 1000) % 100000000;
}

function calcularTotalItem(quantidade: number, valorUnitario: number, desconto = 0) {
  return quantidade * valorUnitario - desconto;
}

export class FiscalService {
  private readonly nfeWeb = new NfeWebClient();

  async listar(ctx: TenantContext, params: { status?: string; vendaId?: string; ordemServicoId?: string; ambienteFiscal?: string }) {
    return prisma.documentoFiscal.findMany({
      where: {
        ...tenantWhere(ctx),
        ...(params.status ? { statusInterno: params.status } : {}),
        ...(params.vendaId ? { vendaId: params.vendaId } : {}),
        ...(params.ordemServicoId ? { ordemServicoId: params.ordemServicoId } : {}),
        ...(params.ambienteFiscal ? { ambienteFiscal: params.ambienteFiscal } : {}),
      },
      include: {
        cliente: { select: { nome: true, cpf: true } },
        venda: { select: { id: true, numero: true } },
        ordemServico: { select: { id: true, numero: true } },
        emitente: { select: { razaoSocial: true, cnpj: true, uf: true } },
        itens: true,
      },
      orderBy: { criadoEm: "desc" },
    });
  }

  async buscarPorId(ctx: TenantContext, id: string) {
    return prisma.documentoFiscal.findFirst({
      where: { id, ...tenantWhere(ctx) },
      include: {
        cliente: true,
        venda: { include: { itens: { include: { produto: true } } } },
        ordemServico: { include: { itens: { include: { produto: true } } } },
        emitente: true,
        naturezaOperacao: true,
        itens: true,
        eventos: { orderBy: { criadoEm: "desc" } },
        xmls: { orderBy: { criadoEm: "desc" } },
        historicoStatus: { orderBy: { criadoEm: "desc" } },
      },
    });
  }

  async criarDaVenda(ctx: TenantContext, vendaId: string, data: CriarDocumentoFiscalDto, usuarioId: string) {
    const venda = await prisma.venda.findUniqueOrThrow({
      where: { id: vendaId, ...tenantWhere(ctx) },
      include: {
        cliente: true,
        documentosFiscais: { where: { statusInterno: { notIn: ["CANCELADA", "INUTILIZADA"] } } },
        itens: { include: { produto: true } },
      },
    });

    if (venda.status !== "CONCLUIDA") throw new Error("Apenas vendas concluídas podem emitir documento fiscal");
    if (venda.documentosFiscais.length > 0) throw new Error("Venda já possui documento fiscal ativo");
    if (venda.itens.length === 0) throw new Error("Venda sem itens para emissão fiscal");

    const emitente = data.emitenteId ? await prisma.emitenteFiscal.findFirst({ where: { id: data.emitenteId, filial: { empresaId: ctx.empresaId } } }) : null;
    const modelo = data.modelo ?? "55";
    const ambienteFiscal = data.ambienteFiscal ?? emitente?.ambienteFiscal ?? "HOMOLOGACAO";
    const serie = modelo === "65" ? (emitente?.serieNfce ?? 1) : (emitente?.serieNfe ?? 1);

    const documento = await prisma.$transaction(async (tx) => {
      const doc = await tx.documentoFiscal.create({
        data: {
          ...tenantCreate(ctx),
          emitenteId: emitente?.id,
          filialId: emitente?.filialId ?? ctx.filialId,
          vendaId: venda.id,
          clienteId: venda.clienteId,
          clienteNome: venda.cliente?.nome ?? "Consumidor",
          naturezaOperacaoId: data.naturezaOperacaoId,
          modelo,
          serie,
          numero: numeroFiscalTemporario(),
          valorTotal: venda.valorTotal,
          statusInterno: "RASCUNHO",
          ambienteFiscal,
          payloadFiscal: {
            origem: "VENDA",
            vendaId: venda.id,
            numeroVenda: venda.numero,
            modelo,
            ambienteFiscal,
          },
          itens: {
            create: venda.itens.map((item) => ({
              produtoId: item.produtoId,
              codigoProduto: item.produto.codigoInterno,
              descricao: item.produto.nome,
              ncm: item.produto.ncm,
              cest: item.produto.cest,
              cfop: item.produto.cfopPadrao,
              unidadeComercial: item.produto.unidadeComercial ?? "UN",
              unidadeTributavel: item.produto.unidadeTributavel ?? "UN",
              gtinEan: item.produto.gtinEan,
              quantidade: item.quantidade,
              valorUnitario: item.precoUnitario,
              valorTotal: calcularTotalItem(item.quantidade, Number(item.precoUnitario), Number(item.desconto)),
              cstCsosnIcms: item.produto.cstCsosnIcms,
              pis: item.produto.pis,
              cofins: item.produto.cofins,
              ipi: item.produto.ipi,
            })),
          },
        },
        include: { itens: true, cliente: true, venda: true },
      });

      await tx.documentoFiscalStatusHistorico.create({
        data: { documentoFiscalId: doc.id, statusNovo: "RASCUNHO", observacao: `Criado a partir da venda ${venda.numero}` },
      });
      await tx.documentoFiscalEvento.create({
        data: { documentoFiscalId: doc.id, tipo: "CRIACAO", status: "RASCUNHO" },
      });
      return doc;
    });

    await registrarAuditoria({ usuarioId, tabela: "documentos_fiscais", registro: documento.id, acao: "CRIAR_DA_VENDA", dadosDepois: documento, tenant: ctx });
    return documento;
  }

  async criarDaOS(ctx: TenantContext, ordemServicoId: string, data: CriarDocumentoFiscalDto, usuarioId: string) {
    const ordem = await prisma.ordemServico.findUniqueOrThrow({
      where: { id: ordemServicoId, ...tenantWhere(ctx) },
      include: { cliente: true, itens: { include: { produto: true } }, documentosFiscais: true },
    });

    if (!["CONCLUIDA", "FINALIZADA", "ENTREGUE"].includes(ordem.status)) throw new Error("OS precisa estar concluída/finalizada para emissão fiscal");
    if (ordem.documentosFiscais.some((doc) => !["CANCELADA", "INUTILIZADA"].includes(doc.statusInterno))) throw new Error("OS já possui documento fiscal ativo");

    const totalPecas = ordem.itens.reduce((acc, item) => acc + calcularTotalItem(item.quantidade, Number(item.precoUnitario)), 0);
    const totalServico = Number(ordem.valorServico ?? ordem.valorMaoObra ?? 0);

    const documento = await prisma.documentoFiscal.create({
      data: {
        ...tenantCreate(ctx),
        ordemServicoId: ordem.id,
        clienteId: ordem.clienteId,
        clienteNome: ordem.cliente.nome,
        modelo: data.modelo ?? "55",
        serie: 1,
        numero: numeroFiscalTemporario(),
        valorTotal: totalPecas,
        statusInterno: "RASCUNHO",
        ambienteFiscal: data.ambienteFiscal ?? "HOMOLOGACAO",
        payloadFiscal: {
          origem: "ORDEM_SERVICO",
          ordemServicoId: ordem.id,
          numeroOS: ordem.numero,
          observacaoFiscal: totalServico > 0 ? "OS possui serviço; avaliar emissão separada de NFS-e conforme município/operação." : null,
        },
        itens: {
          create: ordem.itens.map((item) => ({
            produtoId: item.produtoId,
            codigoProduto: item.produto.codigoInterno,
            descricao: item.produto.nome,
            ncm: item.produto.ncm,
            cest: item.produto.cest,
            cfop: item.produto.cfopPadrao,
            quantidade: item.quantidade,
            valorUnitario: item.precoUnitario,
            valorTotal: calcularTotalItem(item.quantidade, Number(item.precoUnitario)),
            cstCsosnIcms: item.produto.cstCsosnIcms,
            pis: item.produto.pis,
            cofins: item.produto.cofins,
            ipi: item.produto.ipi,
          })),
        },
      },
      include: { itens: true, cliente: true, ordemServico: true },
    });

    await prisma.documentoFiscalStatusHistorico.create({ data: { documentoFiscalId: documento.id, statusNovo: "RASCUNHO", observacao: `Criado a partir da OS ${ordem.numero}` } });
    await registrarAuditoria({ usuarioId, tabela: "documentos_fiscais", registro: documento.id, acao: "CRIAR_DA_OS", dadosDepois: documento, tenant: ctx });
    return documento;
  }

  async atualizarStatus(ctx: TenantContext, id: string, data: AtualizarStatusFiscalDto, usuarioId: string) {
    const anterior = await prisma.documentoFiscal.findFirstOrThrow({ where: { id, ...tenantWhere(ctx) } });
    const atualizado = await prisma.$transaction(async (tx) => {
      const doc = await tx.documentoFiscal.update({
        where: { id },
        data: {
          statusInterno: data.statusInterno,
          statusSefaz: data.statusSefaz,
          protocolo: data.protocolo,
          chave: data.chave,
          justificativa: data.justificativa,
          retornoGateway: data.retornoGateway as never,
          dataEmissao: data.statusInterno === "AUTORIZADA" ? new Date() : anterior.dataEmissao,
        },
        include: { itens: true, cliente: true, venda: true, ordemServico: true },
      });
      await tx.documentoFiscalStatusHistorico.create({ data: { documentoFiscalId: id, statusAnterior: anterior.statusInterno, statusNovo: data.statusInterno, statusSefaz: data.statusSefaz, observacao: data.justificativa } });
      await tx.documentoFiscalEvento.create({ data: { documentoFiscalId: id, tipo: "STATUS", status: data.statusInterno, protocolo: data.protocolo, justificativa: data.justificativa, retornoGateway: data.retornoGateway as never } });
      return doc;
    });
    await registrarAuditoria({ usuarioId, tabela: "documentos_fiscais", registro: id, acao: "ATUALIZAR_STATUS", dadosAntes: anterior, dadosDepois: atualizado, tenant: ctx });
    return atualizado;
  }

  async validar(ctx: TenantContext, id: string, usuarioId: string) {
    const doc = await this.buscarPorId(ctx, id);
    if (!doc) throw new Error("Documento fiscal não encontrado");
    const itensSemNcm = doc.itens.filter((item) => !item.ncm).map((item) => item.descricao);
    if (itensSemNcm.length > 0) throw new Error(`Produtos sem NCM: ${itensSemNcm.join(", ")}`);
    return this.atualizarStatus(ctx, id, { statusInterno: "VALIDADA", statusSefaz: doc.statusSefaz ?? undefined }, usuarioId);
  }

  async transmitir(ctx: TenantContext, id: string, usuarioId: string) {
    const doc = await this.buscarPorId(ctx, id);
    if (!doc) throw new Error("Documento fiscal não encontrado");
    if (!["VALIDADA", "ASSINADA", "REJEITADA", "CONTINGENCIA"].includes(doc.statusInterno)) throw new Error("Documento precisa estar validado/assinado para transmissão");

    try {
      const retorno = await this.nfeWeb.post("/nfe/transmitir", { documentoFiscalId: id, payload: doc.payloadFiscal, itens: doc.itens });
      return this.atualizarStatus(ctx, id, {
        statusInterno: (retorno.statusInterno as string | undefined) === "AUTORIZADA" ? "AUTORIZADA" : "ENVIADA",
        statusSefaz: retorno.statusSefaz as string | undefined,
        protocolo: retorno.protocolo as string | undefined,
        chave: retorno.chave as string | undefined,
        retornoGateway: retorno,
      }, usuarioId);
    } catch (error) {
      return this.atualizarStatus(ctx, id, { statusInterno: "REJEITADA", justificativa: error instanceof Error ? error.message : "Falha ao transmitir" }, usuarioId);
    }
  }

  async cancelar(ctx: TenantContext, id: string, justificativa: string | undefined, usuarioId: string) {
    const doc = await prisma.documentoFiscal.findFirstOrThrow({ where: { id, ...tenantWhere(ctx) } });
    if (!["AUTORIZADA", "ENVIADA"].includes(doc.statusInterno)) throw new Error("Somente documentos autorizados/enviados podem ser cancelados");
    return this.atualizarStatus(ctx, id, { statusInterno: "CANCELADA", justificativa: justificativa ?? "Cancelamento solicitado pelo ERP" }, usuarioId);
  }
}
