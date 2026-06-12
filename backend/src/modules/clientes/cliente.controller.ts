import { Response } from "express";
import { ClienteService } from "./cliente.service.js";
import { getRouteParam } from "../../utils/request.js";
import { TenantRequest } from "../../core/tenant.js";

export class ClienteController {
  private service = new ClienteService();

  async listar(req: TenantRequest, res: Response) {
    const clientes = await this.service.listar(req.tenant!);
    return res.json(clientes);
  }

  async buscarPorId(req: TenantRequest, res: Response) {
    const cliente = await this.service.buscarPorId(getRouteParam(req, "id"), req.tenant!);
    if (!cliente) return res.status(404).json({ message: "Cliente não encontrado" });
    return res.json(cliente);
  }

  async criar(req: TenantRequest, res: Response) {
    const cliente = await this.service.criar(req.body, req.tenant!);
    return res.status(201).json(cliente);
  }

  async atualizar(req: TenantRequest, res: Response) {
    const cliente = await this.service.atualizar(getRouteParam(req, "id"), req.body, req.tenant!);
    return res.json(cliente);
  }

  async excluir(req: TenantRequest, res: Response) {
    await this.service.excluir(getRouteParam(req, "id"), req.tenant!);
    return res.status(204).send();
  }
}
