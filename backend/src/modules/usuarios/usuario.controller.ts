import { Request, Response } from "express";
import { UsuarioService } from "./usuario.service.js";
import { AuthRequest } from "../../middlewares/auth.middleware.js";

export class UsuarioController {
  private service = new UsuarioService();

  async listar(_req: Request, res: Response) {
    return res.json(await this.service.listar());
  }

  async buscarPorId(req: Request, res: Response) {
    const u = await this.service.buscarPorId(req.params.id);
    if (!u) return res.status(404).json({ message: "Usuário não encontrado" });
    return res.json(u);
  }

  async criar(req: Request, res: Response) {
    try {
      const u = await this.service.criar(req.body);
      return res.status(201).json(u);
    } catch (error) {
      return res.status(400).json({ message: error instanceof Error ? error.message : "Erro ao criar usuário" });
    }
  }

  async atualizar(req: Request, res: Response) {
    return res.json(await this.service.atualizar(req.params.id, req.body));
  }

  async alterarSenha(req: AuthRequest, res: Response) {
    try {
      await this.service.alterarSenha(req.user!.sub, req.body);
      return res.json({ message: "Senha alterada com sucesso" });
    } catch (error) {
      return res.status(400).json({ message: error instanceof Error ? error.message : "Erro ao alterar senha" });
    }
  }

  async listarPerfis(_req: Request, res: Response) {
    return res.json(await this.service.listarPerfis());
  }
}
