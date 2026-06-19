import { Router } from "express";
import { NotificacoesController } from "./notificacoes.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireTenant } from "../../core/tenant.js";
import { requireAssinaturaAtiva } from "../../middlewares/saas.middleware.js";

const router = Router();
const c = new NotificacoesController();

router.get("/alertas-estoque", authMiddleware, requireTenant, requireAssinaturaAtiva, c.alertasEstoque.bind(c));
router.get("/resumo", authMiddleware, requireTenant, requireAssinaturaAtiva, c.resumoGeral.bind(c));

export default router;
