import { Router } from "express";
import { DashboardController } from "./dashboard.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireTenant } from "../../core/tenant.js";
import { permissionMiddleware } from "../../middlewares/permission.middleware.js";
import { requireAssinaturaAtiva } from "../../middlewares/saas.middleware.js";

const router = Router();
const controller = new DashboardController();

router.get("/executivo", authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("dashboard.inicio.visualizar"), controller.executivo.bind(controller));
router.get("/indicadores", authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("dashboard.inicio.visualizar"), controller.indicadores.bind(controller));
router.get("/movimentacoes-recentes", authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("dashboard.inicio.visualizar"), controller.movimentacoesRecentes.bind(controller));
router.get("/alertas-estoque", authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("dashboard.inicio.visualizar"), controller.alertasEstoque.bind(controller));

export default router;
