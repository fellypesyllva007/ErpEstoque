import { Response } from "express";
import { CategoriaService } from "./categoria.service.js";
import { getRouteParam } from "../../utils/request.js";
import { TenantRequest } from "../../core/tenant.js";

export class CategoriaController {
  private service = new CategoriaService();
  async listar(req: TenantRequest, res: Response) { return res.json(await this.service.listar(req.tenant!)); }
  async buscarPorId(req: TenantRequest, res: Response) {
    const categoria = await this.service.buscarPorId(req.tenant!, getRouteParam(req, "id"));
    if (!categoria) return res.status(404).json({ message: "Categoria não encontrada" });
    return res.json(categoria);
  }
  async criar(req: TenantRequest, res: Response) { return res.status(201).json(await this.service.criar(req.tenant!, req.body)); }
  async atualizar(req: TenantRequest, res: Response) {
    try { return res.json(await this.service.atualizar(req.tenant!, getRouteParam(req, "id"), req.body)); }
    catch (e) { return res.status(404).json({ message: e instanceof Error ? e.message : "Categoria não encontrada" }); }
  }
}
