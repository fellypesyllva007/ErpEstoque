import { Router } from "express";
import { CompraController } from "./compra.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireTenant } from "../../core/tenant.js";
import { permissionMiddleware } from "../../middlewares/permission.middleware.js";
import { requireAssinaturaAtiva } from "../../middlewares/saas.middleware.js";

const router = Router();
const c = new CompraController();

router.get("/", authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("compras.pedidos.visualizar"), c.listar.bind(c));
router.get("/historico", authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("compras.pedidos.visualizar"), c.historico.bind(c));
router.get("/:id", authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("compras.pedidos.visualizar"), c.buscarPorId.bind(c));
router.post("/", authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("compras.pedidos.criar"), c.criar.bind(c));
router.post("/recebimento", authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("compras.pedidos.receber"), c.registrarRecebimento.bind(c));
router.patch("/:id/cancelar", authMiddleware, requireTenant, requireAssinaturaAtiva, permissionMiddleware("compras.pedidos.cancelar"), c.cancelar.bind(c));

export default router;
