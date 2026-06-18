import { Request, Response } from "express";
import { SaasService } from "./saas.service.js";

const service = new SaasService();
const ok = (res: Response, data: unknown, status = 200) => res.status(status).json(data);
const erro = (res: Response, error: unknown) => res.status(400).json({ message: error instanceof Error ? error.message : "Erro no módulo SaaS" });

export class SaasController {
  async planos(req: Request, res: Response) { try { ok(res, await service.listarPlanos(req.query.incluirInativos === "true")); } catch (e) { erro(res, e); } }
  async cadastrar(req: Request, res: Response) { try { ok(res, await service.autoCadastro(req.body), 201); } catch (e) { erro(res, e); } }
  async adminDashboard(_req: Request, res: Response) { try { ok(res, await service.dashboard()); } catch (e) { erro(res, e); } }
  async salvarPlano(req: Request, res: Response) { try { ok(res, await service.salvarPlano({ ...req.body, id: req.params.id ? String(req.params.id) : undefined })); } catch (e) { erro(res, e); } }
  async atualizarAssinatura(req: Request, res: Response) { try { ok(res, await service.atualizarAssinatura(String(req.params.id), req.body.status)); } catch (e) { erro(res, e); } }
}
