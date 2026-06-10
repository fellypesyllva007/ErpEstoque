import { Request, Response } from "express";
import { DashboardService } from "./dashboard.service.js";

export class DashboardController {
  private service = new DashboardService();

  async indicadores(_req: Request, res: Response) {
    const dados = await this.service.indicadores();
    return res.json(dados);
  }

  async movimentacoesRecentes(_req: Request, res: Response) {
    const dados = await this.service.movimentacoesRecentes();
    return res.json(dados);
  }

  async alertasEstoque(_req: Request, res: Response) {
    const dados = await this.service.alertasEstoque();
    return res.json(dados);
  }
}
