import { Router } from "express";
import { NotificacoesController } from "./notificacoes.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireTenant } from "../../core/tenant.js";
import { permissionMiddleware } from "../../middlewares/permission.middleware.js";

const router = Router();
const c = new NotificacoesController();

router.get("/alertas-estoque", authMiddleware, requireTenant, permissionMiddleware("notificacoes.alertas.visualizar"), c.alertasEstoque.bind(c));
router.get("/resumo", authMiddleware, requireTenant, permissionMiddleware("notificacoes.alertas.visualizar"), c.resumoGeral.bind(c));

export default router;
