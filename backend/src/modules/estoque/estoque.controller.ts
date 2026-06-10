import { Request, Response } from "express";
import { EstoqueService } from "./estoque.service.js";

export class EstoqueController {
  private service = new EstoqueService();

  async registrarMovimentacao(req: Request, res: Response) {
    try {
      const mov = await this.service.registrarMovimentacao(req.body);
      return res.status(201).json(mov);
    } catch (error) {
      return res.status(400).json({ message: error instanceof Error ? error.message : "Erro ao movimentar estoque" });
    }
  }

  async listarMovimentacoes(req: Request, res: Response) {
    const { produtoId } = req.query;
    const movimentacoes = await this.service.listarMovimentacoes(produtoId as string | undefined);
    return res.json(movimentacoes);
  }

  async resumoPorProduto(req: Request, res: Response) {
    const resumo = await this.service.resumoPorProduto(req.params.produtoId);
    return res.json(resumo);
  }
}
