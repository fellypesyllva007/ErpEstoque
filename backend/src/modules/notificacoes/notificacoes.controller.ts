import { Response } from "express";
import { TenantRequest } from "../../core/tenant.js";
import { NotificacoesService } from "./notificacoes.service.js";

export class NotificacoesController {
  private s = new NotificacoesService();
  async alertasEstoque(req: TenantRequest, res: Response) { return res.json(await this.s.alertasEstoque(req.tenant!)); }
  async resumoGeral(req: TenantRequest, res: Response) { return res.json(await this.s.resumoGeral(req.tenant!)); }
}
