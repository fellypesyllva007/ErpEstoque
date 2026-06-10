import { Request, Response } from "express";
import { RelatoriosService } from "./relatorios.service.js";

export class RelatoriosController {
  private s = new RelatoriosService();

  async estoqueCompleto(_req: Request, res: Response) {
    return res.json(await this.s.estoqueCompleto());
  }

  async movimentacoes(req: Request, res: Response) {
    const { dataInicio, dataFim } = req.query;
    return res.json(await this.s.movimentacoesDetalhadas(dataInicio as string, dataFim as string));
  }

  async sugestaoReposicao(_req: Request, res: Response) {
    return res.json(await this.s.sugestaoReposicao());
  }

  async vendas(req: Request, res: Response) {
    const { dataInicio = "", dataFim = "" } = req.query;
    return res.json(await this.s.vendasPorPeriodo(dataInicio as string, dataFim as string));
  }

  async compras(req: Request, res: Response) {
    const { dataInicio = "", dataFim = "" } = req.query;
    return res.json(await this.s.comprasPorPeriodo(dataInicio as string, dataFim as string));
  }

  async auditoria(req: Request, res: Response) {
    const { tabela, dataInicio, dataFim } = req.query;
    return res.json(await this.s.auditoria(tabela as string, dataInicio as string, dataFim as string));
  }
}
