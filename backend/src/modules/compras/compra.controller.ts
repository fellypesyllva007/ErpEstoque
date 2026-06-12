import { Response } from "express";
import { CompraService } from "./compra.service.js";
import { TenantRequest } from "../../core/tenant.js";
import { getQueryString, getRouteParam } from "../../utils/request.js";

export class CompraController {
  private s = new CompraService();

  async listar(req: TenantRequest, res: Response) {
    return res.json(await this.s.listar(req.tenant!, getQueryString(req, "status")));
  }

  async buscarPorId(req: TenantRequest, res: Response) {
    const p = await this.s.buscarPorId(req.tenant!, getRouteParam(req, "id"));
    if (!p) return res.status(404).json({ message: "Pedido não encontrado" });
    return res.json(p);
  }

  async criar(req: TenantRequest, res: Response) {
    try { return res.status(201).json(await this.s.criar(req.tenant!, req.body, req.user!.sub)); }
    catch (e) { return res.status(400).json({ message: e instanceof Error ? e.message : "Erro" }); }
  }

  async registrarRecebimento(req: TenantRequest, res: Response) {
    try { return res.status(201).json(await this.s.registrarRecebimento(req.tenant!, req.body, req.user!.sub)); }
    catch (e) { return res.status(400).json({ message: e instanceof Error ? e.message : "Erro" }); }
  }

  async cancelar(req: TenantRequest, res: Response) {
    try { return res.json(await this.s.cancelar(req.tenant!, getRouteParam(req, "id"), req.user!.sub)); }
    catch (e) { return res.status(400).json({ message: e instanceof Error ? e.message : "Erro" }); }
  }

  async historico(req: TenantRequest, res: Response) {
    return res.json(await this.s.historico(req.tenant!, getQueryString(req, "produtoId"), getQueryString(req, "fornecedorId")));
  }
}
