import { Response } from "express";
import { ProdutoService } from "./produto.service.js";
import { AuthRequest } from "../../middlewares/auth.middleware.js";

export class ProdutoController {
  private service = new ProdutoService();

  async listar(_req: AuthRequest, res: Response) {
    const produtos = await this.service.listar();
    return res.json(produtos);
  }

  async buscarPorId(req: AuthRequest, res: Response) {
    const produto = await this.service.buscarPorId(req.params.id);
    if (!produto) return res.status(404).json({ message: "Produto não encontrado" });
    return res.json(produto);
  }

  async criar(req: AuthRequest, res: Response) {
    const produto = await this.service.criar(req.body, req.user!.sub);
    return res.status(201).json(produto);
  }

  async atualizar(req: AuthRequest, res: Response) {
    const produto = await this.service.atualizar(req.params.id, req.body, req.user!.sub);
    return res.json(produto);
  }

  async excluir(req: AuthRequest, res: Response) {
    await this.service.excluir(req.params.id, req.user!.sub);
    return res.status(204).send();
  }

  async estoqueBaixo(_req: AuthRequest, res: Response) {
    const produtos = await this.service.estoqueBaixo();
    return res.json(produtos);
  }

  async estoqueZerado(_req: AuthRequest, res: Response) {
    const produtos = await this.service.estoqueZerado();
    return res.json(produtos);
  }
}
