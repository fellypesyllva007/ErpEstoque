import { Response } from "express";
import { TenantRequest } from "../../core/tenant.js";
import { CadastrosService } from "./cadastros.service.js";

export class CadastrosController {
  private service = new CadastrosService();
  empresas(_req: TenantRequest, res: Response) { return this.service.empresas().then((r) => res.json(r)); }
  filiais(req: TenantRequest, res: Response) { return this.service.filiais(req.tenant!).then((r) => res.json(r)); }
  unidades(req: TenantRequest, res: Response) { return this.service.unidades(req.tenant!).then((r) => res.json(r)); }
  criarUnidade(req: TenantRequest, res: Response) { return this.service.criarUnidade(req.tenant!, req.body).then((r) => res.status(201).json(r)); }
  condicoes(req: TenantRequest, res: Response) { return this.service.condicoes(req.tenant!).then((r) => res.json(r)); }
  criarCondicao(req: TenantRequest, res: Response) { return this.service.criarCondicao(req.tenant!, req.body).then((r) => res.status(201).json(r)); }
  formas(req: TenantRequest, res: Response) { return this.service.formas(req.tenant!).then((r) => res.json(r)); }
  criarForma(req: TenantRequest, res: Response) { return this.service.criarForma(req.tenant!, req.body).then((r) => res.status(201).json(r)); }
  centros(req: TenantRequest, res: Response) { return this.service.centros(req.tenant!).then((r) => res.json(r)); }
  criarCentro(req: TenantRequest, res: Response) { return this.service.criarCentro(req.tenant!, req.body).then((r) => res.status(201).json(r)); }
  plano(req: TenantRequest, res: Response) { return this.service.plano(req.tenant!).then((r) => res.json(r)); }
  criarConta(req: TenantRequest, res: Response) { return this.service.criarConta(req.tenant!, req.body).then((r) => res.status(201).json(r)); }
}
