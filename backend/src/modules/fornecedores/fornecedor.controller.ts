import { Request, Response } from "express";
import { FornecedorService } from "./fornecedor.service.js";
import { getRouteParam } from "../../utils/request.js";

export class FornecedorController {
  private service = new FornecedorService();

  async listar(_req: Request, res: Response) {
    const fornecedores = await this.service.listar();
    return res.json(fornecedores);
  }

  async buscarPorId(req: Request, res: Response) {
    const fornecedor = await this.service.buscarPorId(getRouteParam(req, "id"));
    if (!fornecedor) return res.status(404).json({ message: "Fornecedor não encontrado" });
    return res.json(fornecedor);
  }

  async criar(req: Request, res: Response) {
    const fornecedor = await this.service.criar(req.body);
    return res.status(201).json(fornecedor);
  }

  async atualizar(req: Request, res: Response) {
    const fornecedor = await this.service.atualizar(getRouteParam(req, "id"), req.body);
    return res.json(fornecedor);
  }

  async excluir(req: Request, res: Response) {
    await this.service.excluir(getRouteParam(req, "id"));
    return res.status(204).send();
  }
}
