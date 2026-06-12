import { Response } from "express";
import { RelatoriosService } from "./relatorios.service.js";
import { TenantRequest } from "../../core/tenant.js";

export class RelatoriosController {
  private s = new RelatoriosService();

  async estoqueCompleto(req: TenantRequest, res: Response) {
    return res.json(await this.s.estoqueCompleto(req.tenant!));
  }

  async movimentacoes(req: TenantRequest, res: Response) {
    const { dataInicio, dataFim } = req.query;
    return res.json(await this.s.movimentacoesDetalhadas(req.tenant!, dataInicio as string, dataFim as string));
  }

  async sugestaoReposicao(req: TenantRequest, res: Response) {
    return res.json(await this.s.sugestaoReposicao(req.tenant!));
  }

  async vendas(req: TenantRequest, res: Response) {
    const { dataInicio = "", dataFim = "" } = req.query;
    return res.json(await this.s.vendasPorPeriodo(req.tenant!, dataInicio as string, dataFim as string));
  }

  async compras(req: TenantRequest, res: Response) {
    const { dataInicio = "", dataFim = "" } = req.query;
    return res.json(await this.s.comprasPorPeriodo(req.tenant!, dataInicio as string, dataFim as string));
  }

  async auditoria(req: TenantRequest, res: Response) {
    const { tabela, dataInicio, dataFim } = req.query;
    return res.json(await this.s.auditoria(req.tenant!, tabela as string, dataInicio as string, dataFim as string));
  }
}
