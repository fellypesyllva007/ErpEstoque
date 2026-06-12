import { Response } from "express";
import { FornecedorService } from "./fornecedor.service.js";
import { getRouteParam } from "../../utils/request.js";
import { TenantRequest } from "../../core/tenant.js";

export class FornecedorController {
  private service = new FornecedorService();

  async listar(req: TenantRequest, res: Response) {
    const fornecedores = await this.service.listar(req.tenant!);
    return res.json(fornecedores);
  }

  async buscarPorId(req: TenantRequest, res: Response) {
    const fornecedor = await this.service.buscarPorId(getRouteParam(req, "id"), req.tenant!);
    if (!fornecedor) return res.status(404).json({ message: "Fornecedor não encontrado" });
    return res.json(fornecedor);
  }

  async criar(req: TenantRequest, res: Response) {
    const fornecedor = await this.service.criar(req.body, req.tenant!);
    return res.status(201).json(fornecedor);
  }

  async atualizar(req: TenantRequest, res: Response) {
    const fornecedor = await this.service.atualizar(getRouteParam(req, "id"), req.body, req.tenant!);
    return res.json(fornecedor);
  }

  async excluir(req: TenantRequest, res: Response) {
    await this.service.excluir(getRouteParam(req, "id"), req.tenant!);
    return res.status(204).send();
  }
}
