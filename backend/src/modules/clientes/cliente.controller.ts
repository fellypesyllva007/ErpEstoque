import { Request, Response } from "express";
import { ClienteService } from "./cliente.service.js";
import { getRouteParam } from "../../utils/request.js";

export class ClienteController {
  private service = new ClienteService();

  async listar(_req: Request, res: Response) {
    const clientes = await this.service.listar();
    return res.json(clientes);
  }

  async buscarPorId(req: Request, res: Response) {
    const cliente = await this.service.buscarPorId(getRouteParam(req, "id"));
    if (!cliente) return res.status(404).json({ message: "Cliente não encontrado" });
    return res.json(cliente);
  }

  async criar(req: Request, res: Response) {
    const cliente = await this.service.criar(req.body);
    return res.status(201).json(cliente);
  }

  async atualizar(req: Request, res: Response) {
    const cliente = await this.service.atualizar(getRouteParam(req, "id"), req.body);
    return res.json(cliente);
  }

  async excluir(req: Request, res: Response) {
    await this.service.excluir(getRouteParam(req, "id"));
    return res.status(204).send();
  }
}
