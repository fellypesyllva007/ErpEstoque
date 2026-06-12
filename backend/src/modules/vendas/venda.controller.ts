import { Response } from "express";
import { VendaService } from "./venda.service.js";
import { AuthRequest } from "../../middlewares/auth.middleware.js";
import { getQueryString, getRouteParam } from "../../utils/request.js";

export class VendaController {
  private s = new VendaService();

  async listar(req: AuthRequest, res: Response) {
    const { status, dataInicio, dataFim } = req.query;
    return res.json(await this.s.listar(getQueryString(req, "status"), getQueryString(req, "dataInicio"), getQueryString(req, "dataFim")));
  }

  async buscarPorId(req: AuthRequest, res: Response) {
    const v = await this.s.buscarPorId(getRouteParam(req, "id"));
    if (!v) return res.status(404).json({ message: "Venda não encontrada" });
    return res.json(v);
  }

  async criar(req: AuthRequest, res: Response) {
    try {
      return res.status(201).json(await this.s.criar(req.body, req.user!.sub));
    } catch (e) { return res.status(400).json({ message: e instanceof Error ? e.message : "Erro" }); }
  }

  async cancelar(req: AuthRequest, res: Response) {
    try {
      return res.json(await this.s.cancelar(getRouteParam(req, "id"), req.user!.sub));
    } catch (e) { return res.status(400).json({ message: e instanceof Error ? e.message : "Erro" }); }
  }

  async rankingMaisVendidos(req: AuthRequest, res: Response) {
    const periodo = (req.query.periodo as "mes" | "ano" | "30dias") ?? "mes";
    return res.json(await this.s.rankingMaisVendidos(periodo));
  }

  async indicadoresHoje(_req: AuthRequest, res: Response) {
    return res.json(await this.s.indicadoresHoje());
  }
}
