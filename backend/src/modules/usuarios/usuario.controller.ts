import { Response } from "express";
import { UsuarioService } from "./usuario.service.js";
import { AuthRequest } from "../../middlewares/auth.middleware.js";
import { TenantRequest } from "../../core/tenant.js";
import { getRouteParam } from "../../utils/request.js";

export class UsuarioController {
  private service = new UsuarioService();

  async listar(req: TenantRequest, res: Response) { return res.json(await this.service.listar(req.tenant!)); }

  async buscarPorId(req: TenantRequest, res: Response) {
    const u = await this.service.buscarPorId(req.tenant!, getRouteParam(req, "id"));
    if (!u) return res.status(404).json({ message: "Usuário não encontrado" });
    return res.json(u);
  }

  async criar(req: TenantRequest, res: Response) {
    try { return res.status(201).json(await this.service.criar(req.tenant!, req.body)); }
    catch (error) { return res.status(400).json({ message: error instanceof Error ? error.message : "Erro ao criar usuário" }); }
  }

  async atualizar(req: TenantRequest, res: Response) {
    try { return res.json(await this.service.atualizar(req.tenant!, getRouteParam(req, "id"), req.body)); }
    catch (error) { return res.status(400).json({ message: error instanceof Error ? error.message : "Erro ao atualizar usuário" }); }
  }

  async alterarSenha(req: AuthRequest, res: Response) {
    try { await this.service.alterarSenha(req.user!.sub, req.body); return res.json({ message: "Senha alterada com sucesso" }); }
    catch (error) { return res.status(400).json({ message: error instanceof Error ? error.message : "Erro ao alterar senha" }); }
  }

  async listarPerfis(req: TenantRequest, res: Response) { return res.json(await this.service.listarPerfis(req.tenant!)); }
}
