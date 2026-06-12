import { Request, Response } from "express";
import { MarcaService } from "./marca.service.js";
import { getRouteParam } from "../../utils/request.js";

export class MarcaController {
  private service = new MarcaService();

  async listar(_req: Request, res: Response) {
    const marcas = await this.service.listar();
    return res.json(marcas);
  }

  async buscarPorId(req: Request, res: Response) {
    const marca = await this.service.buscarPorId(getRouteParam(req, "id"));
    if (!marca) return res.status(404).json({ message: "Marca não encontrada" });
    return res.json(marca);
  }

  async criar(req: Request, res: Response) {
    const marca = await this.service.criar(req.body);
    return res.status(201).json(marca);
  }

  async atualizar(req: Request, res: Response) {
    const marca = await this.service.atualizar(getRouteParam(req, "id"), req.body);
    return res.json(marca);
  }

  async excluir(req: Request, res: Response) {
    await this.service.excluir(getRouteParam(req, "id"));
    return res.status(204).send();
  }
}
