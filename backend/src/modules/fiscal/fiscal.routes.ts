import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireTenant } from "../../core/tenant.js";
import { requireAssinaturaAtiva } from "../../middlewares/saas.middleware.js";
import { FiscalController } from "./fiscal.controller.js";

const router = Router();
const controller = new FiscalController();

router.get("/nfe", authMiddleware, requireTenant, requireAssinaturaAtiva, controller.listar.bind(controller));
router.get("/nfe/:id", authMiddleware, requireTenant, requireAssinaturaAtiva, controller.buscarPorId.bind(controller));
router.post("/nfe/from-venda/:vendaId", authMiddleware, requireTenant, requireAssinaturaAtiva, controller.criarDaVenda.bind(controller));
router.post("/nfe/from-os/:osId", authMiddleware, requireTenant, requireAssinaturaAtiva, controller.criarDaOS.bind(controller));
router.post("/nfe/:id/validar", authMiddleware, requireTenant, requireAssinaturaAtiva, controller.validar.bind(controller));
router.post("/nfe/:id/transmitir", authMiddleware, requireTenant, requireAssinaturaAtiva, controller.transmitir.bind(controller));
router.post("/nfe/:id/cancelar", authMiddleware, requireTenant, requireAssinaturaAtiva, controller.cancelar.bind(controller));

export default router;
