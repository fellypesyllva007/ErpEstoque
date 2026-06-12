import { Response } from "express";
import { ProdutoService } from "./produto.service.js";
import { TenantRequest } from "../../core/tenant.js";
import { getRouteParam } from "../../utils/request.js";

export class ProdutoController {
  private service = new ProdutoService();

  async listar(req: TenantRequest, res: Response) {
    const produtos = await this.service.listar(req.tenant!);
    return res.json(produtos);
  }

  async buscarPorId(req: TenantRequest, res: Response) {
    const produto = await this.service.buscarPorId(getRouteParam(req, "id"), req.tenant!);
    if (!produto) return res.status(404).json({ message: "Produto não encontrado" });
    return res.json(produto);
  }

  async criar(req: TenantRequest, res: Response) {
    const produto = await this.service.criar(req.body, req.user!.sub, req.tenant!);
    return res.status(201).json(produto);
  }

  async atualizar(req: TenantRequest, res: Response) {
    const produto = await this.service.atualizar(getRouteParam(req, "id"), req.body, req.user!.sub, req.tenant!);
    return res.json(produto);
  }

  async excluir(req: TenantRequest, res: Response) {
    await this.service.excluir(getRouteParam(req, "id"), req.user!.sub, req.tenant!);
    return res.status(204).send();
  }

  async estoqueBaixo(req: TenantRequest, res: Response) {
    const produtos = await this.service.estoqueBaixo(req.tenant!);
    return res.json(produtos);
  }

  async estoqueZerado(req: TenantRequest, res: Response) {
    const produtos = await this.service.estoqueZerado(req.tenant!);
    return res.json(produtos);
  }
}
