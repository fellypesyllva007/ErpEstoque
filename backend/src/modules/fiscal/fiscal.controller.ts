import { Response } from "express";
import { TenantRequest } from "../../core/tenant.js";
import { getQueryString, getRouteParam } from "../../utils/request.js";
import { FiscalService } from "./fiscal.service.js";

export class FiscalController {
  private readonly service = new FiscalService();

  async listar(req: TenantRequest, res: Response) {
    return res.json(await this.service.listar(req.tenant!, {
      status: getQueryString(req, "status"),
      vendaId: getQueryString(req, "vendaId"),
      ordemServicoId: getQueryString(req, "ordemServicoId"),
      ambienteFiscal: getQueryString(req, "ambienteFiscal"),
    }));
  }

  async buscarPorId(req: TenantRequest, res: Response) {
    const doc = await this.service.buscarPorId(req.tenant!, getRouteParam(req, "id"));
    if (!doc) return res.status(404).json({ message: "Documento fiscal não encontrado" });
    return res.json(doc);
  }

  async criarDaVenda(req: TenantRequest, res: Response) {
    try {
      return res.status(201).json(await this.service.criarDaVenda(req.tenant!, getRouteParam(req, "vendaId"), req.body, req.user!.sub));
    } catch (error) {
      return res.status(400).json({ message: error instanceof Error ? error.message : "Erro fiscal" });
    }
  }

  async criarDaOS(req: TenantRequest, res: Response) {
    try {
      return res.status(201).json(await this.service.criarDaOS(req.tenant!, getRouteParam(req, "osId"), req.body, req.user!.sub));
    } catch (error) {
      return res.status(400).json({ message: error instanceof Error ? error.message : "Erro fiscal" });
    }
  }

  async validar(req: TenantRequest, res: Response) {
    try {
      return res.json(await this.service.validar(req.tenant!, getRouteParam(req, "id"), req.user!.sub));
    } catch (error) {
      return res.status(400).json({ message: error instanceof Error ? error.message : "Erro fiscal" });
    }
  }

  async transmitir(req: TenantRequest, res: Response) {
    try {
      return res.json(await this.service.transmitir(req.tenant!, getRouteParam(req, "id"), req.user!.sub));
    } catch (error) {
      return res.status(400).json({ message: error instanceof Error ? error.message : "Erro fiscal" });
    }
  }

  async cancelar(req: TenantRequest, res: Response) {
    try {
      return res.json(await this.service.cancelar(req.tenant!, getRouteParam(req, "id"), req.body?.justificativa, req.user!.sub));
    } catch (error) {
      return res.status(400).json({ message: error instanceof Error ? error.message : "Erro fiscal" });
    }
  }
}
