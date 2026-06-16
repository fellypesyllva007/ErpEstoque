import { Response } from "express";
import { EstoqueService } from "./estoque.service.js";
import { getQueryString, getRouteParam } from "../../utils/request.js";
import { TenantRequest } from "../../core/tenant.js";

export class EstoqueController {
  private service = new EstoqueService();

  async registrarMovimentacao(req: TenantRequest, res: Response) {
    try {
      const mov = await this.service.registrarMovimentacao(req.body, req.tenant!);
      return res.status(201).json(mov);
    } catch (error) {
      return res.status(400).json({ message: error instanceof Error ? error.message : "Erro ao movimentar estoque" });
    }
  }

  async listarMovimentacoes(req: TenantRequest, res: Response) {
    const movimentacoes = await this.service.listarMovimentacoes(req.tenant!, getQueryString(req, "produtoId"));
    return res.json(movimentacoes);
  }

  async resumoPorProduto(req: TenantRequest, res: Response) {
    const resumo = await this.service.resumoPorProduto(req.tenant!, getRouteParam(req, "produtoId"));
    return res.json(resumo);
  }
}
