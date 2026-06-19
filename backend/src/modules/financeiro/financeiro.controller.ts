import { Response } from "express";
import { TenantRequest } from "../../core/tenant.js";
import { getRouteParam } from "../../utils/request.js";
import { FinanceiroService } from "./financeiro.service.js";

export class FinanceiroController {
  private service = new FinanceiroService();

  receber(req: TenantRequest, res: Response) { return this.service.listarReceber(req.tenant!).then((r) => res.json(r)); }
  criarReceber(req: TenantRequest, res: Response) { return this.service.criarReceber(req.tenant!, req.body).then((r) => res.status(201).json(r)); }
  baixarReceber(req: TenantRequest, res: Response) { return this.service.baixarReceber(req.tenant!, getRouteParam(req, "id"), Number(req.body.valor)).then((r) => res.json(r)); }
  pagar(req: TenantRequest, res: Response) { return this.service.listarPagar(req.tenant!).then((r) => res.json(r)); }
  criarPagar(req: TenantRequest, res: Response) { return this.service.criarPagar(req.tenant!, req.body).then((r) => res.status(201).json(r)); }
  baixarPagar(req: TenantRequest, res: Response) { return this.service.baixarPagar(req.tenant!, getRouteParam(req, "id"), Number(req.body.valor)).then((r) => res.json(r)); }
  caixa(req: TenantRequest, res: Response) { return this.service.movimentosCaixa(req.tenant!).then((r) => res.json(r)); }
  fluxo(req: TenantRequest, res: Response) { return this.service.fluxoCaixa(req.tenant!).then((r) => res.json(r)); }
  dre(req: TenantRequest, res: Response) { return this.service.dre(req.tenant!, req.query.dataInicio as string | undefined, req.query.dataFim as string | undefined, req.query.regime as "CAIXA" | "COMPETENCIA" | undefined).then((r) => res.json(r)); }
  balancete(req: TenantRequest, res: Response) { return this.service.balancete(req.tenant!, req.query.dataInicio as string | undefined, req.query.dataFim as string | undefined).then((r) => res.json(r)); }
  razao(req: TenantRequest, res: Response) { return this.service.razao(req.tenant!, getRouteParam(req, "contaId")).then((r) => res.json(r)); }
  diario(req: TenantRequest, res: Response) { return this.service.diario(req.tenant!, req.query.dataInicio as string | undefined, req.query.dataFim as string | undefined).then((r) => res.json(r)); }
  fecharPeriodo(req: TenantRequest, res: Response) { return this.service.fecharPeriodo(req.tenant!, Number(req.body.ano), Number(req.body.mes), req.body.observacao).then((r) => res.json(r)); }
  conciliacoes(req: TenantRequest, res: Response) { return this.service.listarConciliacoes(req.tenant!).then((r) => res.json(r)); }
  criarConciliacao(req: TenantRequest, res: Response) { return this.service.conciliacao(req.tenant!, req.body).then((r) => res.status(201).json(r)); }
  aprovarPagamento(req: TenantRequest, res: Response) { return this.service.aprovarPagamento(req.tenant!, getRouteParam(req, "id"), req.body.motivo).then((r) => res.json(r)); }
}
