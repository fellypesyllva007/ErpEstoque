import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireTenant } from "../../core/tenant.js";
import { permissionMiddleware } from "../../middlewares/permission.middleware.js";
import { FiscalController } from "./fiscal.controller.js";

const router = Router();
const controller = new FiscalController();

router.get("/nfe", authMiddleware, requireTenant, permissionMiddleware("fiscal.nfe.visualizar"), controller.listar.bind(controller));
router.get("/nfe/:id", authMiddleware, requireTenant, permissionMiddleware("fiscal.nfe.visualizar"), controller.buscarPorId.bind(controller));
router.post("/nfe/from-venda/:vendaId", authMiddleware, requireTenant, permissionMiddleware("fiscal.nfe.criar"), controller.criarDaVenda.bind(controller));
router.post("/nfe/from-os/:osId", authMiddleware, requireTenant, permissionMiddleware("fiscal.nfe.criar"), controller.criarDaOS.bind(controller));
router.post("/nfe/:id/validar", authMiddleware, requireTenant, permissionMiddleware("fiscal.nfe.validar"), controller.validar.bind(controller));
router.post("/nfe/:id/transmitir", authMiddleware, requireTenant, permissionMiddleware("fiscal.nfe.transmitir"), controller.transmitir.bind(controller));
router.post("/nfe/:id/cancelar", authMiddleware, requireTenant, permissionMiddleware("fiscal.nfe.cancelar"), controller.cancelar.bind(controller));

export default router;
