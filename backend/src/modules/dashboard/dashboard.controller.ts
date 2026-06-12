import { Response } from "express";
import { DashboardService } from "./dashboard.service.js";
import { TenantRequest } from "../../core/tenant.js";

export class DashboardController {
  private service = new DashboardService();

  async indicadores(req: TenantRequest, res: Response) {
    const dados = await this.service.indicadores(req.tenant!);
    return res.json(dados);
  }

  async movimentacoesRecentes(req: TenantRequest, res: Response) {
    const dados = await this.service.movimentacoesRecentes(req.tenant!);
    return res.json(dados);
  }

  async alertasEstoque(req: TenantRequest, res: Response) {
    const dados = await this.service.alertasEstoque(req.tenant!);
    return res.json(dados);
  }
}
