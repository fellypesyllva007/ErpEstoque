import { Response } from "express";
import { VendaService } from "./venda.service.js";
import { TenantRequest } from "../../core/tenant.js";
import { getQueryString, getRouteParam } from "../../utils/request.js";

export class VendaController {
  private s = new VendaService();

  async listar(req: TenantRequest, res: Response) {
    return res.json(await this.s.listar(req.tenant!, getQueryString(req, "status"), getQueryString(req, "dataInicio"), getQueryString(req, "dataFim")));
  }

  async buscarPorId(req: TenantRequest, res: Response) {
    const v = await this.s.buscarPorId(req.tenant!, getRouteParam(req, "id"));
    if (!v) return res.status(404).json({ message: "Venda não encontrada" });
    return res.json(v);
  }

  async criar(req: TenantRequest, res: Response) {
    try { return res.status(201).json(await this.s.criar(req.tenant!, req.body, req.user!.sub)); }
    catch (e) { return res.status(400).json({ message: e instanceof Error ? e.message : "Erro" }); }
  }

  async cancelar(req: TenantRequest, res: Response) {
    try { return res.json(await this.s.cancelar(req.tenant!, getRouteParam(req, "id"), req.user!.sub)); }
    catch (e) { return res.status(400).json({ message: e instanceof Error ? e.message : "Erro" }); }
  }

  async rankingMaisVendidos(req: TenantRequest, res: Response) {
    const periodo = (req.query.periodo as "mes" | "ano" | "30dias") ?? "mes";
    return res.json(await this.s.rankingMaisVendidos(req.tenant!, periodo));
  }

  async indicadoresHoje(req: TenantRequest, res: Response) {
    return res.json(await this.s.indicadoresHoje(req.tenant!));
  }
}
