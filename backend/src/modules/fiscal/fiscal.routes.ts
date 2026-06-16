import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireTenant } from "../../core/tenant.js";
import { FiscalController } from "./fiscal.controller.js";

const router = Router();
const controller = new FiscalController();

router.get("/nfe", authMiddleware, requireTenant, controller.listar.bind(controller));
router.get("/nfe/:id", authMiddleware, requireTenant, controller.buscarPorId.bind(controller));
router.post("/nfe/from-venda/:vendaId", authMiddleware, requireTenant, controller.criarDaVenda.bind(controller));
router.post("/nfe/from-os/:osId", authMiddleware, requireTenant, controller.criarDaOS.bind(controller));
router.post("/nfe/:id/validar", authMiddleware, requireTenant, controller.validar.bind(controller));
router.post("/nfe/:id/transmitir", authMiddleware, requireTenant, controller.transmitir.bind(controller));
router.post("/nfe/:id/cancelar", authMiddleware, requireTenant, controller.cancelar.bind(controller));

export default router;
