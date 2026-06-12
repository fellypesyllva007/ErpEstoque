import { Response } from "express";
import { OSService } from "./os.service.js";
import { AuthRequest } from "../../middlewares/auth.middleware.js";
import { getQueryString, getRouteParam } from "../../utils/request.js";

export class OSController {
  private s = new OSService();

  async listar(req: AuthRequest, res: Response) {
    return res.json(await this.s.listar(getQueryString(req, "status")));
  }
  async buscarPorId(req: AuthRequest, res: Response) {
    const os = await this.s.buscarPorId(getRouteParam(req, "id"));
    if (!os) return res.status(404).json({ message: "OS não encontrada" });
    return res.json(os);
  }
  async criar(req: AuthRequest, res: Response) {
    try { return res.status(201).json(await this.s.criar(req.body, req.user!.sub)); }
    catch (e) { return res.status(400).json({ message: e instanceof Error ? e.message : "Erro" }); }
  }
  async atualizar(req: AuthRequest, res: Response) {
    return res.json(await this.s.atualizar(getRouteParam(req, "id"), req.body, req.user!.sub));
  }
  async adicionarPeca(req: AuthRequest, res: Response) {
    try { return res.status(201).json(await this.s.adicionarPeca(getRouteParam(req, "id"), req.body, req.user!.sub)); }
    catch (e) { return res.status(400).json({ message: e instanceof Error ? e.message : "Erro" }); }
  }
  async removerPeca(req: AuthRequest, res: Response) {
    return res.json(await this.s.removerPeca(getRouteParam(req, "itemId"), req.user!.sub));
  }
  async contarPorStatus(_req: AuthRequest, res: Response) {
    return res.json(await this.s.contarPorStatus());
  }
}
