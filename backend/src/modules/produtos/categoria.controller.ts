import { Request, Response } from "express";

import { CategoriaService } from "./categoria.service.js";
import { getRouteParam } from "../../utils/request.js";

export class CategoriaController {
  private service = new CategoriaService();

  async listar(_req: Request, res: Response) {
    const categorias = await this.service.listar();

    return res.json(categorias);
  }

  async buscarPorId(req: Request, res: Response) {
    const categoria = await this.service.buscarPorId(
      getRouteParam(req, "id")
    );

    if (!categoria) {
      return res.status(404).json({
        message: "Categoria não encontrada",
      });
    }

    return res.json(categoria);
  }

  async criar(req: Request, res: Response) {
    const categoria = await this.service.criar(req.body);

    return res.status(201).json(categoria);
  }

  async atualizar(req: Request, res: Response) {
    const categoria = await this.service.atualizar(
      getRouteParam(req, "id"),
      req.body
    );

    return res.json(categoria);
  }
}
