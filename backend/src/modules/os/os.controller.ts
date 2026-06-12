import { Response } from "express";
import { OSService } from "./os.service.js";
import { TenantRequest } from "../../core/tenant.js";
import { getQueryString, getRouteParam } from "../../utils/request.js";

export class OSController {
  private s = new OSService();

  async listar(req: TenantRequest, res: Response) { return res.json(await this.s.listar(req.tenant!, getQueryString(req, "status"))); }
  async buscarPorId(req: TenantRequest, res: Response) {
    const os = await this.s.buscarPorId(req.tenant!, getRouteParam(req, "id"));
    if (!os) return res.status(404).json({ message: "OS não encontrada" });
    return res.json(os);
  }
  async criar(req: TenantRequest, res: Response) {
    try { return res.status(201).json(await this.s.criar(req.tenant!, req.body, req.user!.sub)); }
    catch (e) { return res.status(400).json({ message: e instanceof Error ? e.message : "Erro" }); }
  }
  async atualizar(req: TenantRequest, res: Response) {
    try { return res.json(await this.s.atualizar(req.tenant!, getRouteParam(req, "id"), req.body, req.user!.sub)); }
    catch (e) { return res.status(400).json({ message: e instanceof Error ? e.message : "Erro" }); }
  }
  async adicionarPeca(req: TenantRequest, res: Response) {
    try { return res.status(201).json(await this.s.adicionarPeca(req.tenant!, getRouteParam(req, "id"), req.body, req.user!.sub)); }
    catch (e) { return res.status(400).json({ message: e instanceof Error ? e.message : "Erro" }); }
  }
  async removerPeca(req: TenantRequest, res: Response) {
    try { return res.json(await this.s.removerPeca(req.tenant!, getRouteParam(req, "itemId"), req.user!.sub)); }
    catch (e) { return res.status(400).json({ message: e instanceof Error ? e.message : "Erro" }); }
  }
  async contarPorStatus(req: TenantRequest, res: Response) { return res.json(await this.s.contarPorStatus(req.tenant!)); }
}
