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

  async saldoDisponivel(req: TenantRequest, res: Response) { return res.json(await this.service.saldoDisponivel(req.tenant!, getRouteParam(req, "produtoId"))); }
  async reservar(req: TenantRequest, res: Response) {
    try { return res.status(201).json(await this.service.reservar(req.tenant!, req.body)); }
    catch (error) { return res.status(400).json({ message: error instanceof Error ? error.message : "Erro ao reservar estoque" }); }
  }
  async kardex(req: TenantRequest, res: Response) { return res.json(await this.service.kardex(req.tenant!, getRouteParam(req, "produtoId"))); }
  async abrirInventario(req: TenantRequest, res: Response) { return res.status(201).json(await this.service.abrirInventario(req.tenant!, req.body)); }
  async listarInventarios(req: TenantRequest, res: Response) { return res.json(await this.service.listarInventarios(req.tenant!)); }
  async contarInventario(req: TenantRequest, res: Response) { return res.json(await this.service.contarInventario(req.tenant!, getRouteParam(req, "itemId"), Number(req.body.estoqueContado), req.body.observacao)); }
  async criarTransferencia(req: TenantRequest, res: Response) { return res.status(201).json(await this.service.criarTransferencia(req.tenant!, req.body)); }
  async enviarTransferencia(req: TenantRequest, res: Response) { return res.json(await this.service.enviarTransferencia(req.tenant!, getRouteParam(req, "id"))); }
}
