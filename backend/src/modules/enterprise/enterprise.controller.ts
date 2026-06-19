import { Response } from "express";
import { TenantRequest } from "../../core/tenant.js";
import { EnterpriseService } from "./enterprise.service.js";
import { getRouteParam } from "../../utils/request.js";

const service = new EnterpriseService();
const ctx = (req: TenantRequest) => req.tenant!;
const ok = (res: Response, p: unknown) => res.json(p);
const created = (res: Response, p: unknown) => res.status(201).json(p);

export class EnterpriseController {
  leads = async (req: TenantRequest, res: Response) => ok(res, await service.leads(ctx(req)));
  criarLead = async (req: TenantRequest, res: Response) => created(res, await service.criarLead(ctx(req), req.body));
  oportunidades = async (req: TenantRequest, res: Response) => ok(res, await service.oportunidades(ctx(req)));
  criarOportunidade = async (req: TenantRequest, res: Response) => created(res, await service.criarOportunidade(ctx(req), req.body));
  atividades = async (req: TenantRequest, res: Response) => ok(res, await service.atividades(ctx(req)));
  criarAtividade = async (req: TenantRequest, res: Response) => created(res, await service.criarAtividade(ctx(req), req.body));
  pipeline = async (req: TenantRequest, res: Response) => ok(res, await service.pipeline(ctx(req)));
  solicitacoesCompra = async (req: TenantRequest, res: Response) => ok(res, await service.solicitacoesCompra(ctx(req)));
  criarSolicitacaoCompra = async (req: TenantRequest, res: Response) => created(res, await service.criarSolicitacaoCompra(ctx(req), req.body));
  aprovarSolicitacao = async (req: TenantRequest, res: Response) => ok(res, await service.aprovarSolicitacao(ctx(req), getRouteParam(req, "id")));
  cotacoesCompra = async (req: TenantRequest, res: Response) => ok(res, await service.cotacoesCompra(ctx(req)));
  criarCotacaoCompra = async (req: TenantRequest, res: Response) => created(res, await service.criarCotacaoCompra(ctx(req), req.body));
  orcamentosVenda = async (req: TenantRequest, res: Response) => ok(res, await service.orcamentosVenda(ctx(req)));
  criarOrcamentoVenda = async (req: TenantRequest, res: Response) => created(res, await service.criarOrcamentoVenda(ctx(req), req.body));
  pedidosVenda = async (req: TenantRequest, res: Response) => ok(res, await service.pedidosVenda(ctx(req)));
  criarPedidoVenda = async (req: TenantRequest, res: Response) => created(res, await service.criarPedidoVenda(ctx(req), req.body));
  tabelasPreco = async (req: TenantRequest, res: Response) => ok(res, await service.tabelasPreco(ctx(req)));
  criarTabelaPreco = async (req: TenantRequest, res: Response) => created(res, await service.criarTabelaPreco(ctx(req), req.body));
  configuracoesTributarias = async (req: TenantRequest, res: Response) => ok(res, await service.configuracoesTributarias(ctx(req)));
  criarConfiguracaoTributaria = async (req: TenantRequest, res: Response) => created(res, await service.criarConfiguracaoTributaria(ctx(req), req.body));
  entradasFiscais = async (req: TenantRequest, res: Response) => ok(res, await service.entradasFiscais(ctx(req)));
  criarEntradaFiscal = async (req: TenantRequest, res: Response) => created(res, await service.criarEntradaFiscal(ctx(req), req.body));
}
