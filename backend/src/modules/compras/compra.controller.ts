import { Response } from "express";
import { CompraService } from "./compra.service.js";
import { AuthRequest } from "../../middlewares/auth.middleware.js";
import { getQueryString, getRouteParam } from "../../utils/request.js";

export class CompraController {
  private s = new CompraService();

  async listar(req: AuthRequest, res: Response) {
    return res.json(await this.s.listar(getQueryString(req, "status")));
  }

  async buscarPorId(req: AuthRequest, res: Response) {
    const p = await this.s.buscarPorId(getRouteParam(req, "id"));
    if (!p) return res.status(404).json({ message: "Pedido não encontrado" });
    return res.json(p);
  }

  async criar(req: AuthRequest, res: Response) {
    try {
      const p = await this.s.criar(req.body, req.user!.sub);
      return res.status(201).json(p);
    } catch (e) { return res.status(400).json({ message: e instanceof Error ? e.message : "Erro" }); }
  }

  async registrarRecebimento(req: AuthRequest, res: Response) {
    try {
      const r = await this.s.registrarRecebimento(req.body, req.user!.sub);
      return res.status(201).json(r);
    } catch (e) { return res.status(400).json({ message: e instanceof Error ? e.message : "Erro" }); }
  }

  async cancelar(req: AuthRequest, res: Response) {
    return res.json(await this.s.cancelar(getRouteParam(req, "id"), req.user!.sub));
  }

  async historico(req: AuthRequest, res: Response) {
    const { produtoId, fornecedorId } = req.query;
    return res.json(await this.s.historico(getQueryString(req, "produtoId"), getQueryString(req, "fornecedorId")));
  }
}
