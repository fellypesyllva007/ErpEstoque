import { Request, Response } from "express";
import { NotificacoesService } from "./notificacoes.service.js";

export class NotificacoesController {
  private s = new NotificacoesService();

  async alertasEstoque(_req: Request, res: Response) {
    return res.json(await this.s.alertasEstoque());
  }

  async resumoGeral(_req: Request, res: Response) {
    return res.json(await this.s.resumoGeral());
  }
}
