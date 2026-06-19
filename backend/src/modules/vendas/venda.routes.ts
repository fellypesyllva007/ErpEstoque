import { Router } from "express";
import { VendaController } from "./venda.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireTenant } from "../../core/tenant.js";
import { permissionMiddleware } from "../../middlewares/permission.middleware.js";
import { requireAssinaturaAtiva } from "../../middlewares/saas.middleware.js";

const router = Router();
const c = new VendaController();

router.get("/", authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("vendas.lista.visualizar"), c.listar.bind(c));
router.get("/ranking", authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("vendas.relatorios.visualizar"), c.rankingMaisVendidos.bind(c));
router.get("/indicadores-hoje", authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("vendas.lista.visualizar"), c.indicadoresHoje.bind(c));
router.get("/:id", authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("vendas.lista.visualizar"), c.buscarPorId.bind(c));
router.post("/", authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("vendas.lista.criar"), c.criar.bind(c));
router.patch("/:id/cancelar", authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("vendas.lista.cancelar"), c.cancelar.bind(c));

export default router;
