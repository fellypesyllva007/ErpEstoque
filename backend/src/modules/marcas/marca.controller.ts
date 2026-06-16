import { Response } from "express";
import { MarcaService } from "./marca.service.js";
import { getRouteParam } from "../../utils/request.js";
import { TenantRequest } from "../../core/tenant.js";

export class MarcaController {
  private service = new MarcaService();
  async listar(req: TenantRequest, res: Response) { return res.json(await this.service.listar(req.tenant!)); }
  async buscarPorId(req: TenantRequest, res: Response) {
    const marca = await this.service.buscarPorId(req.tenant!, getRouteParam(req, "id"));
    if (!marca) return res.status(404).json({ message: "Marca não encontrada" });
    return res.json(marca);
  }
  async criar(req: TenantRequest, res: Response) { return res.status(201).json(await this.service.criar(req.tenant!, req.body)); }
  async atualizar(req: TenantRequest, res: Response) {
    try { return res.json(await this.service.atualizar(req.tenant!, getRouteParam(req, "id"), req.body)); }
    catch (e) { return res.status(404).json({ message: e instanceof Error ? e.message : "Marca não encontrada" }); }
  }
  async excluir(req: TenantRequest, res: Response) {
    try { await this.service.excluir(req.tenant!, getRouteParam(req, "id")); return res.status(204).send(); }
    catch (e) { return res.status(404).json({ message: e instanceof Error ? e.message : "Marca não encontrada" }); }
  }
}
