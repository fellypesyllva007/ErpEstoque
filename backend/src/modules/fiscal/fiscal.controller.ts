import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware.js";
import { getQueryString, getRouteParam } from "../../utils/request.js";
import { FiscalService } from "./fiscal.service.js";

export class FiscalController {
  private readonly service = new FiscalService();

  async listar(req: AuthRequest, res: Response) {
    return res.json(await this.service.listar({
      status: getQueryString(req, "status"),
      vendaId: getQueryString(req, "vendaId"),
      ordemServicoId: getQueryString(req, "ordemServicoId"),
      ambienteFiscal: getQueryString(req, "ambienteFiscal"),
    }));
  }

  async buscarPorId(req: AuthRequest, res: Response) {
    const doc = await this.service.buscarPorId(getRouteParam(req, "id"));
    if (!doc) return res.status(404).json({ message: "Documento fiscal não encontrado" });
    return res.json(doc);
  }

  async criarDaVenda(req: AuthRequest, res: Response) {
    try {
      return res.status(201).json(await this.service.criarDaVenda(getRouteParam(req, "vendaId"), req.body, req.user!.sub));
    } catch (error) {
      return res.status(400).json({ message: error instanceof Error ? error.message : "Erro fiscal" });
    }
  }

  async criarDaOS(req: AuthRequest, res: Response) {
    try {
      return res.status(201).json(await this.service.criarDaOS(getRouteParam(req, "osId"), req.body, req.user!.sub));
    } catch (error) {
      return res.status(400).json({ message: error instanceof Error ? error.message : "Erro fiscal" });
    }
  }

  async validar(req: AuthRequest, res: Response) {
    try {
      return res.json(await this.service.validar(getRouteParam(req, "id"), req.user!.sub));
    } catch (error) {
      return res.status(400).json({ message: error instanceof Error ? error.message : "Erro fiscal" });
    }
  }

  async transmitir(req: AuthRequest, res: Response) {
    try {
      return res.json(await this.service.transmitir(getRouteParam(req, "id"), req.user!.sub));
    } catch (error) {
      return res.status(400).json({ message: error instanceof Error ? error.message : "Erro fiscal" });
    }
  }

  async cancelar(req: AuthRequest, res: Response) {
    try {
      return res.json(await this.service.cancelar(getRouteParam(req, "id"), req.body?.justificativa, req.user!.sub));
    } catch (error) {
      return res.status(400).json({ message: error instanceof Error ? error.message : "Erro fiscal" });
    }
  }
}
